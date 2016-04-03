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
