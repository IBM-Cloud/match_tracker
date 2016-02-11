package com.match_tracker.twitter;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.PartitionInfo;
import org.apache.kafka.common.TopicPartition;

import com.eclipsesource.json.Json;
import com.eclipsesource.json.JsonObject;

public class TwitterSearchExecutorWithRecovery extends TwitterSearchExecutor {

	private static final Logger log = Logger.getLogger(TwitterSearchExecutorWithRecovery.class.getName());

	private Properties consumerProps;
	private String consumerTopic;
	

	public TwitterSearchExecutorWithRecovery(Properties consumerProps, Properties producerProps, String consumerTopic,
			String producerTopic, TwitterSearch twitterSearch) {		
		super(consumerProps, producerProps, consumerTopic, producerTopic, twitterSearch);
		this.consumerProps = consumerProps;
		this.consumerTopic = consumerTopic;
	}

	public void start() {
		KafkaConsumer<String, String> consumer = getConsumerAtOffsetStart(consumerTopic);
		
		ConsumerRecords<String, String> records = consumer.poll(POLL_TIMEOUT);
		log.log(Level.INFO, "Twitter Search Recovery Poll produced {0} records for processing.", String.valueOf(records.count()));
		
		long lastOffset = -1;
		for (ConsumerRecord<String, String> record : records) {
    	   log.log(Level.FINE, "Processing record @ offset {0}.", String.valueOf(record.offset())); 
    	   if (isSearchLive(record)) {
    		   log.log(Level.INFO, "Starting recovered Twitter search, {0}.", record.key());
    		   processRecord(record);	           
    	   } else {
    		   log.log(Level.INFO, "Ignoring recovered Twitter search, {0}.", record.key());
    	   }
    	   log.log(Level.FINE, "Finished processing record @ offset {0}.", String.valueOf(record.offset()));
    	   lastOffset = record.offset();
       }
       
       log.log(Level.INFO, "Finished processing previous records, last offset ({0}).", String.valueOf(lastOffset));
       consumer.close();
       super.start();
	}
	
	protected boolean isSearchLive(ConsumerRecord<String, String> record) {
		boolean isSearchLive = false;
		
		String searchQueryJsonStr = record.value();
		JsonObject searchQuery = Json.parse(searchQueryJsonStr).asObject();
		ZonedDateTime endTime = ZonedDateTime.parse(searchQuery.get("endTime").asString());
		
		if (endTime.isAfter(ZonedDateTime.now())) {
			isSearchLive = true;
		}
		
		return isSearchLive;
	}
	
	protected KafkaConsumer<String, String> getConsumerAtOffsetStart(String topic) {
		KafkaConsumer<String, String> consumer = new KafkaConsumer<String, String>(consumerProps);
		
		List<PartitionInfo> info = consumer.partitionsFor(topic);
		
		info.forEach(partition -> {
			TopicPartition tp = new TopicPartition(topic, partition.partition());
			List<TopicPartition> topicPartitionList = new ArrayList<TopicPartition>();
			topicPartitionList.add(tp);
			consumer.assign(topicPartitionList);
			consumer.seekToBeginning(tp);
		});
		
		return consumer;
	}
}
