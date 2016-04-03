/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.match_tracker.twitter;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Properties;
import java.util.StringJoiner;
import java.util.logging.ConsoleHandler;
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;
import java.util.logging.SimpleFormatter;
import java.util.logging.StreamHandler;

import com.eclipsesource.json.Json;
import com.eclipsesource.json.JsonArray;
import com.eclipsesource.json.JsonObject;

public class TwitterSearchService {

	public static final String KAFKA_CONSUMER_PROPS = "/kafka_consumer.properties";
	public static final String KAFKA_PRODUCER_PROPS = "/kafka_producer.properties";
	public static final String SEARCHES_TOPIC = "twitter_search_topic";
	public static final String TWEETS_TOPIC = "tweet_results_topic";
	public static final String TWITTER_SERVICE = "twitterinsights";
	public static final String KAFKA_SERVICE = "messagehub";
	
	private static final Logger log = Logger.getLogger(TwitterSearchService.class.getName());
	
	public static void main(String[] args) throws MalformedURLException {
		Logger globalLogger = Logger.getLogger("");
		Handler[] handlers = globalLogger.getHandlers();
		for(Handler handler : handlers) {
		    globalLogger.removeHandler(handler);
		}
		
		globalLogger.addHandler(new DualConsoleHandler());
		
		log.log(Level.INFO, "TwitterSearchService initialisation...");
		Properties consumerProps = new Properties();
		Properties producerProps = new Properties();

		try {
		    // load a properties file
		    consumerProps.load(TwitterSearchService.class.getResourceAsStream(KAFKA_CONSUMER_PROPS));
		    producerProps.load(TwitterSearchService.class.getResourceAsStream(KAFKA_PRODUCER_PROPS));
		} catch (IOException ex) {
			log.severe("Unable to read Kakfa message broker properties.");
			System.exit(-1);
		}
		
		String VCAP_SERVICES = System.getenv("VCAP_SERVICES");
		if (VCAP_SERVICES == null) {
			System.out.println("Unable to read VCAP_SERVICES.");
			throw new RuntimeException("Unable to read VCAP_SERVICES");
		}
		
		JsonObject vcapServices = Json.parse(VCAP_SERVICES).asObject();
		JsonObject twitterService = vcapServices.get(TWITTER_SERVICE).asArray().get(0).asObject();
		String twitterAuthUrl = twitterService.get("credentials").asObject().get("url").asString();
		log.log(Level.INFO, "Twitter Service Auth Url: {0}", twitterAuthUrl);
		
		JsonObject kakfaService = vcapServices.get(KAFKA_SERVICE).asArray().get(0).asObject();
		JsonArray kafkaBrokers = kakfaService.get("credentials").asObject().get("kafka_brokers_sasl").asArray();
		
		StringJoiner brokerListJoiner = new StringJoiner(",");				 
		kafkaBrokers.forEach(action -> brokerListJoiner.add(action.asString()));
		consumerProps.setProperty("bootstrap.servers", brokerListJoiner.toString());
		producerProps.setProperty("bootstrap.servers", brokerListJoiner.toString());
		log.log(Level.INFO, "IBM MessageHub Brokers: {0}", consumerProps.get("bootstrap.servers"));
		log.log(Level.INFO, "Twitter Search Messages Topic: {0}", consumerProps.getProperty(SEARCHES_TOPIC));
		log.log(Level.INFO, "Tweet Results Topic: {0}", producerProps.getProperty(TWEETS_TOPIC));
		
		TwitterSearch twitterSearch = new TwitterSearch(new URL(twitterAuthUrl));
		TwitterSearchExecutorWithRecovery executor = new TwitterSearchExecutorWithRecovery(consumerProps, producerProps, consumerProps.getProperty(SEARCHES_TOPIC), producerProps.getProperty(TWEETS_TOPIC), twitterSearch);
		log.log(Level.INFO, "TwitterSearchService initialisation finished.");
		log.log(Level.INFO, "Starting TwitterSearchExecutor...");
		executor.start();
	}

	public static class DualConsoleHandler extends StreamHandler {

	    private final ConsoleHandler stderrHandler = new ConsoleHandler();

	    public DualConsoleHandler() {
	        super(System.out, new SimpleFormatter());
	    }

	    @Override
	    public void publish(LogRecord record) {
	        if (record.getLevel().intValue() <= Level.INFO.intValue()) {
	            super.publish(record);
	            super.flush();
	        } else {
	            stderrHandler.publish(record);
	            stderrHandler.flush();
	        }
	    }
	}
}
