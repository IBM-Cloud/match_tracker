package com.match_tracker.tweets;

import java.util.List;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.lightcouch.CouchDbClient;
import org.lightcouch.CouchDbException;
import org.lightcouch.Response;

public class MatchTweetsDB {

	private static final Logger log = Logger.getLogger(MatchTweetsDB.class.getName());
	
	private static int conflictCounter = 0;
	
	CouchDbClient client;
	
	public MatchTweetsDB(Properties creds) {
		this.client = new CouchDbClient("match_tweets", true, "https", creds.getProperty("host"), 
			new Integer(creds.getProperty("port")), creds.getProperty("username"), creds.getProperty("password"));
	}
	
	public boolean addTweets(List<MatchTweet> tweets) {
		conflictCounter = 0;
		
		if (tweets.isEmpty()) return true;
		try {
			List<Response> bulkResponse = this.client.bulk(tweets, false);		
			bulkResponse.forEach(response -> {			
				if (response.getError() != null) {
					if (response.getError().equals("conflict")) {
						conflictCounter += 1;
						return;
					}
					
					log.log(Level.WARNING, "Unable to add match tweet, error: {0}, reason: {1}", 
							new Object[] {response.getError(), response.getReason()});				
				}
			});
			
			log.log(Level.INFO, "Insert {0} documents ({1} conflicts.)", 
					new Object[] {tweets.size(), conflictCounter});
		} catch (CouchDbException e) {
			log.log(Level.WARNING, "Exception thrown adding tweets to CouchDB: ", e.getMessage()); 
			return false;
		}
		
		return true;
	}
}
