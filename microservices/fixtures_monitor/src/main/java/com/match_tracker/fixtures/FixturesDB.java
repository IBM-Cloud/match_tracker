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
package com.match_tracker.fixtures;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.lightcouch.CouchDbClient;
import org.lightcouch.Response;

public class FixturesDB {

	private static final Logger log = Logger.getLogger(FixturesDB.class.getName());
	
	CouchDbClient client;
	
	public FixturesDB(Properties creds) {
		this.client = new CouchDbClient("fixtures", true, "https", creds.getProperty("host"), 
			new Integer(creds.getProperty("port")), creds.getProperty("username"), creds.getProperty("password"));
	}
	
	public Boolean isInitialized() {
		return !retrieveAll().isEmpty();
	}
	
	public void update(List<Fixture> fixtures) {
		if (!isInitialized()) {
			log.log(Level.INFO, "Missing fixtures from database, initialising...");
			insertFixtures(fixtures);
			return;
		}
		
		log.log(Level.INFO, "Comparing current fixtures to new list.");
		List<FixtureDocument> modifiedFixtures = getModifiedFixtures(fixtures);
		
		log.log(Level.INFO, "Discovered {0} fixtures have been updated.", modifiedFixtures.size());
		if (!modifiedFixtures.isEmpty()) {
			updateFixtures(modifiedFixtures);	
		}		
	}
	
	public  List<FixtureDocument> getModifiedFixtures(List<Fixture> fixtures) {
		Map<String, Fixture> fixtureLookup = new HashMap<String, Fixture>();
		fixtures.forEach(fixture -> fixtureLookup.put(fixture.getId(), fixture));
		
		List<FixtureDocument> existing = retrieveAll();		
		List<FixtureDocument> modifiedFixtures = new ArrayList<FixtureDocument>();
		
		existing.forEach(fixture -> {
			String id = fixture.getId();
			Fixture lastestFixture = fixtureLookup.get(id);
			if (fixture.update(lastestFixture)) {				
				modifiedFixtures.add(fixture);
			}
		});
		
		return modifiedFixtures;
	}
	
	public List<FixtureDocument> retrieveAll() {
		List<FixtureDocument> allDocs = this.client.view("matches/all").includeDocs(true).query(FixtureDocument.class);
		return allDocs;
	}
	
	public List<FixtureDocument> retrieveFutureFixtures() {
		long secondOffset = 1;
		List<FixtureDocument> futureFixtures = this.client.view("matches/match_dates")
				.startKey(LocalDateTime.now()
				.plus(secondOffset, ChronoUnit.SECONDS).toString())
				.includeDocs(true)
				.query(FixtureDocument.class);		
		return futureFixtures;
	}
	
	public List<FixtureDocument> retrieveNextFixtures() {
		List<FixtureDocument> fixtures = this.retrieveFutureFixtures();	
		Integer firstMatch = 0, lastMatch = 0;		
		String firstMatchDate = fixtures.get(0).getDate();
		
		for (FixtureDocument fixture: fixtures) {
			if (!firstMatchDate.equals(fixture.getDate())) break;
			lastMatch++;
		}
		
		return fixtures.subList(firstMatch, lastMatch);
	}

	protected void updateFixtures(List<FixtureDocument> fixtures) {
		List<Response> bulkResponse = this.client.bulk(fixtures, false);
		bulkResponse.forEach(response -> {
			if (response.getError() != null) {
				log.log(Level.WARNING, "Unable to update fixture, error: {0}, reason: {1}", 
						new Object[] {response.getError(), response.getReason()});
			}
		});
	}
	
	protected void insertFixtures(List<Fixture> fixtures) {
		List<Response> bulkResponse = this.client.bulk(fixtures, false);
		bulkResponse.forEach(response -> {
			if (response.getError() != null) {
				log.log(Level.WARNING, "Unable to insert fixture, error: {0}, reason: {1}", 
						new Object[] {response.getError(), response.getReason()});
			}
		});
	}
}
