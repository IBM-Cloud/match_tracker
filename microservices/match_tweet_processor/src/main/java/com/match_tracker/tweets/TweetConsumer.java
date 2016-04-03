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
package com.match_tracker.tweets;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.TopicPartition;

import com.eclipsesource.json.ParseException;

public class TweetConsumer {

	private static final Logger log = Logger.getLogger(TweetConsumer.class.getName());
	
	protected KafkaConsumer<String, String> consumer;
	protected List<String> topics;
	protected final Integer POLL_TIMEOUT = 1000 * 60; 
	protected Boolean running = false;
	protected MatchTweetsDB matchTweetsDB;
	
	public TweetConsumer(Properties props, String topic, MatchTweetsDB matchTweetsDB) {
		this.matchTweetsDB = matchTweetsDB;
		props.put("enable.auto.commit", "false");
		this.consumer = new KafkaConsumer<String, String>(props);
		consumer.subscribe(Arrays.asList(topic));	
	}
	
	public void stop() {
		this.running = false;
	}
	
	public void start() {
		this.running = true;
		while (this.running) {
	       ConsumerRecords<String, String> records = consumer.poll(POLL_TIMEOUT);
	       long lastOffset = -1;	       
	       if (!records.isEmpty()) {
	    	   log.log(Level.INFO, "Poll produced {0} records for processing.", String.valueOf(records.count()));
	       }
	       
	       List<MatchTweet> matchTweets = new ArrayList<>();
	       for (ConsumerRecord<String, String> record : records) {
	    	   if (lastOffset == -1) {
	    		   log.log(Level.INFO, "Starting processing records, first offset ({0}).", String.valueOf(record.offset()));
	    	   }
	    		
	    	   log.log(Level.FINE, "Processing record @ offset {0}.", String.valueOf(record.offset()));
	    	   try {
	    		   MatchTweet tweet = new MatchTweet(record.value());
	    		   matchTweets.add(tweet);   
	    	   } catch (ParseException ex) {
	    		   log.log(Level.WARNING, "Error parsing tweet JSON for record: " + record.key(), ex);
	    	   }
	    	          
	    	   log.log(Level.FINE, "Finished processing record @ offset {0}.", String.valueOf(record.offset()));
	    	   lastOffset = record.offset();
	       }
	       
	       if (matchTweetsDB.addTweets(matchTweets)) {
	    	   consumer.commitSync();
		       if (!records.isEmpty()) {
		    	   log.log(Level.INFO, "Finished processing records, last offset ({0}).", String.valueOf(lastOffset));
		       }   
	       } else {
	    	   Set<TopicPartition> partitions = consumer.assignment();
	    	   partitions.forEach(partition -> consumer.seek(partition, consumer.committed(partition).offset()));
	    	   log.log(Level.WARNING, "Failed to process records, resetting offset from {0} and trying again.", String.valueOf(lastOffset));
	       }	       
	     }
	}
}
