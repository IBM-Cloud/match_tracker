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

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.consumer.OffsetAndMetadata;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;

public class TwitterSearchRecovery {
	protected Properties consumerProps;
	protected List<String> topics;
	protected final Integer POLL_TIMEOUT = 60 * 1000; 
	
	protected static final Integer OFFSET_BATCH_SEEK = 100;
	
	public TwitterSearchRecovery(Properties props) {
		props.put("enable.auto.commit", "false");
		this.consumerProps = props;
	}
	
	protected void recover() {
		getConsumerAtOffsetStart("searches");
	}
	
	protected KafkaConsumer<String, String> getConsumerAtOffsetStart(String topic) {
		KafkaConsumer<String, String> consumer = new KafkaConsumer<String, String>(this.consumerProps);
		
		List<PartitionInfo> info = consumer.partitionsFor(topic);
		System.out.println(info.size());
		
		info.forEach(partition -> {
			TopicPartition tp = new TopicPartition(topic, partition.partition());
			List<TopicPartition> topicPartitionList = new ArrayList<TopicPartition>();
			topicPartitionList.add(tp);
			consumer.assign(topicPartitionList);
			consumer.seekToBeginning(tp);
		});
		
		return consumer;
	}
	

	protected KafkaConsumer<String, String> getConsumerBeforeLastOffset(String topic) {
		this.consumerProps.setProperty("group.id", "tweet_consumer_service");
		KafkaConsumer<String, String> consumer = new KafkaConsumer<String, String>(this.consumerProps);
		
		List<PartitionInfo> info = consumer.partitionsFor(topic);
		System.out.println(info.size());
		
		info.forEach(partition -> {
			TopicPartition tp = new TopicPartition(topic, partition.partition());			
			List<TopicPartition> topicPartitionList = new ArrayList<TopicPartition>();
			topicPartitionList.add(tp);
			consumer.assign(topicPartitionList);
			OffsetAndMetadata om = consumer.committed(tp);
			consumer.seek(tp, om.offset() - 100);
		});
		
		return consumer;
	}	
	
}
