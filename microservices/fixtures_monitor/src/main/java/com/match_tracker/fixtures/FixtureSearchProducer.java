package com.match_tracker.fixtures;

import java.util.Properties;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;

public class FixtureSearchProducer {

	private static final Logger log = Logger.getLogger(FixtureSearchProducer.class.getName());
	
	protected final KafkaProducer<String, String> producer;	
	protected Properties props;	
	protected final String TWITTER_SEARCH_TOPIC = "twitter_search_topic";
	
	public FixtureSearchProducer(Properties props) {
		this.props = props;
		producer = new KafkaProducer<String, String>(props);
	}
		
	public void send(String key, String value) {	
		log.log(Level.FINE, "Sending new key ({0}) and value ({1}) to 'twitter_search_topics'", new Object[] {key, value});
		
		 ProducerRecord<String, String> record = new ProducerRecord<String, String>(props.getProperty(TWITTER_SEARCH_TOPIC), key, value);
	     Future<RecordMetadata> future = producer.send(record, (metadata, exceptions) -> {
	    	 if (exceptions != null) {
	    		 log.log(Level.WARNING, "Failed to send record to 'twitter_search_topics'.", exceptions);
	    		 return;
	    	 }
	    	 
	    	 log.log(Level.FINE, "Sent record to 'twitter_search_topics' @ {0} (offset)", String.valueOf(metadata.offset()));
	     });
	     try {
	         future.get(); 	         
	      } catch (ExecutionException ex) { 
	    	  log.log(Level.WARNING, "Failed to send record to 'twitter_search_topics'.", ex);
	      } catch (InterruptedException e) {
	    	  log.log(Level.WARNING, "Failed to send record to 'twitter_search_topics'.", e);
		}
	 }
}
