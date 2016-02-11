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
