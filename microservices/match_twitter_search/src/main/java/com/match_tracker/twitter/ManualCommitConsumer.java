package com.match_tracker.twitter;

import java.util.List;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;

public abstract class ManualCommitConsumer {

	private static final Logger log = Logger.getLogger(ManualCommitConsumer.class.getName());
	
	protected KafkaConsumer<String, String> consumer;
	protected List<String> topics;
	protected final Integer POLL_TIMEOUT = 1000 * 60; 
	protected Boolean running = false;
	
	public ManualCommitConsumer(Properties props, List<String> topics) {
		props.put("enable.auto.commit", "false");
		this.consumer = new KafkaConsumer<String, String>(props);
		consumer.subscribe(topics);	
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
	       for (ConsumerRecord<String, String> record : records) {
	    	   if (lastOffset == -1) {
	    		   log.log(Level.INFO, "Starting processing records, first offset ({0}).", String.valueOf(record.offset()));
	    	   }
	    		
	    	   log.log(Level.FINE, "Processing record @ offset {0}.", String.valueOf(record.offset()));   	    	   
	    	   processRecord(record);	           
	    	   log.log(Level.FINE, "Finished processing record @ offset {0}.", String.valueOf(record.offset()));
	    	   lastOffset = record.offset();
	       }
	       consumer.commitSync();
	       if (!records.isEmpty()) {
	    	   log.log(Level.INFO, "Finished processing records, last offset ({0}).", String.valueOf(lastOffset));
	       }
	     }
	}
	
	protected abstract void processRecord(ConsumerRecord<String, String> record);

}
