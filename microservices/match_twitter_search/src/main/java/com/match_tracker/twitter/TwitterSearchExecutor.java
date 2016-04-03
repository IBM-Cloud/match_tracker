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

import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;

import com.eclipsesource.json.Json;
import com.eclipsesource.json.JsonObject;

public class TwitterSearchExecutor extends ManualCommitConsumer {

	private static final Logger log = Logger.getLogger(TwitterSearchExecutor.class.getName());

	protected static final int MAX_POOL_SIZE = 20;
	protected ExecutorService thread_pool = Executors.newFixedThreadPool(MAX_POOL_SIZE);

	protected TwitterSearch twitterSearch;
	protected final KafkaProducer<String, String> producer;	
	protected String producerTopic;

	public TwitterSearchExecutor(Properties consumerProps, Properties producerProps, String consumerTopic,
			String producerTopic, TwitterSearch twitterSearch) {
		super(consumerProps, Arrays.asList(consumerTopic));
		this.twitterSearch = twitterSearch;
		this.producer = new KafkaProducer<String, String>(producerProps);
		this.producerTopic = producerTopic;
	}

	@Override
	protected void processRecord(ConsumerRecord<String, String> record) {
		String searchQueryJsonStr = record.value();
		String searchId = record.key();
		JsonObject searchQuery = Json.parse(searchQueryJsonStr).asObject();

		String searchQueryText = searchQuery.get("searchQuery").asString();
		ZonedDateTime startTime = ZonedDateTime.parse(searchQuery.get("startTime").asString());
		ZonedDateTime endTime = ZonedDateTime.parse(searchQuery.get("endTime").asString());

		this.thread_pool.execute(() -> {
			Integer tweetsCount = this.twitterSearch.search(searchId, searchQueryText, startTime, endTime,
					(JsonObject tweet) -> {
				tweet.set("fixture", searchId);
				String tweetId = tweet.get("message").asObject().get("id").asString();				
				sendTweetRecord(tweetId, tweet.toString());
			});
			log.log(Level.INFO, "Twitter Search Finished ({0}), found {1} results.",
					new Object[] { searchId, tweetsCount });
		});

		log.log(Level.INFO, "Twitter Search Scheduled ({0}).", searchId);
	}

	protected void sendTweetRecord(String key, String value) {
		log.log(Level.FINE, "Sending record {0} to 'tweet_results_topic'", key);
		
		ProducerRecord<String, String> record 
			= new ProducerRecord<String, String>(producerTopic, key, value);
		
		producer.send(record, (metadata, exceptions) -> {
			if (exceptions != null) {
				log.log(Level.WARNING, "Failed to send record to 'tweet_results_topic'.", exceptions);
				return;
			}

			log.log(Level.FINE, "Sent record to 'tweet_results_topic' @ {0} (offset)",
				String.valueOf(metadata.offset()));
		});
	}
}