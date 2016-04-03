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

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.eclipsesource.json.Json;
import com.eclipsesource.json.JsonArray;
import com.eclipsesource.json.JsonObject;
import com.eclipsesource.json.JsonValue;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;

public class FixturesService {
	private static final Logger log = Logger.getLogger(FixturesService.class.getName());
	
	protected final static String SEASONS_URL = "http://api.football-data.org/v1/soccerseasons";
	
	public List<Fixture> getFixtures() throws RemoteServiceUnavailable {
		log.log(Level.INFO, "Retrieving current BPL fixtures...");
		
		List<Fixture> fixtures = new ArrayList<Fixture>();
		JsonObject currentSeason = this.getCurrentBPLFixtures();
		JsonArray fixturesList = currentSeason.get("fixtures").asArray();
		fixturesList.forEach(fixture -> fixtures.add(convertJsonObjToFixture(fixture)));
		
		log.log(Level.INFO, "Retrieved {0} fixtures.", fixtures.size());
		return fixtures;
	}
	
	protected Fixture convertJsonObjToFixture (JsonValue fixtureData) {
		JsonObject fixtureObj = fixtureData.asObject();
		String homeTeam = fixtureObj.get("homeTeamName").asString();
		String awayTeam = fixtureObj.get("awayTeamName").asString();
		String date = fixtureObj.get("date").asString();
		String status = fixtureObj.get("status").asString();
		Integer matchDay = fixtureObj.get("matchday").asInt();
		
		JsonObject matchResult = fixtureObj.get("result").asObject();
		Integer homeGoals = null, awayGoals = null;
		
		if (!matchResult.get("goalsHomeTeam").isNull()) {
			homeGoals = matchResult.get("goalsHomeTeam").asInt();
		}
		
		if (!matchResult.get("goalsAwayTeam").isNull()) {
			awayGoals = matchResult.get("goalsAwayTeam").asInt();
		}
		
		return new Fixture(homeTeam, awayTeam, matchDay, date, homeGoals, awayGoals, status);
	}
	
	public void getFixtures(Date lastModified) {
		
	}
	
	protected JsonObject getCurrentBPLFixtures() throws RemoteServiceUnavailable {
		JsonObject season = getCurrentBPLSeason();
		String seasonLink = season.get("_links").asObject().get("fixtures").asObject().get("href").asString();
		return getSeasonFixtures(seasonLink);
	}
	
	protected JsonObject getSeasonFixtures(String seasonFixturesLink) throws RemoteServiceUnavailable {
		HttpResponse<String> response;
		try {
			response = Unirest.get(seasonFixturesLink).asString();
			JsonValue seasons = Json.parse(response.getBody().toString());
			return seasons.asObject();
		} catch (UnirestException e) {
			String message = "Unable to retrieve season fixtures, service unavailable.";
			log.log(Level.WARNING, message, e);
			throw new RemoteServiceUnavailable(message);
		}
	}
	
	protected JsonObject getCurrentBPLSeason() throws RemoteServiceUnavailable {
		JsonArray allSeasons = this.getSeasons();
		JsonObject currentBPLSeason = null;
		
		Iterator<JsonValue> seasonIter = allSeasons.iterator();
		
		while (currentBPLSeason == null && seasonIter.hasNext()) {
			JsonObject season = seasonIter.next().asObject();
			String league = season.get("league").asString();
			if (league.equals("PL")) {
				currentBPLSeason = season;
			}
		}
		
		return currentBPLSeason;
	}
	
	protected JsonArray getSeasons() throws RemoteServiceUnavailable {
		try {
			HttpResponse<String> response = Unirest.get(FixturesService.SEASONS_URL).asString();
			JsonValue seasons = Json.parse(response.getBody().toString());
			return seasons.asArray();
		} catch (UnirestException e) {
			String message = "Unable to retrieve seasons, service unavailable.";
			log.log(Level.WARNING, message, e);
			throw new RemoteServiceUnavailable(message);
		}		
	}	
}
