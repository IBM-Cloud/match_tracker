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

import com.google.gson.annotations.SerializedName;

public class Fixture {
	@SerializedName("_id") String id; 
	
	protected String homeTeam, awayTeam, date, status;
	protected Integer matchDay, homeTeamGoals, awayTeamGoals;
	
	public Fixture() {		
	}
	
	public Fixture(String homeTeam, String awayTeam, Integer matchDay, String date, String status) {
		this.id = homeTeam + " v " + awayTeam;
		this.homeTeam = homeTeam;
		this.awayTeam = awayTeam;
		this.matchDay = matchDay;
		this.date = date;
		this.homeTeamGoals = null;
		this.awayTeamGoals = null;
		this.status = status;
	}
	
	public Fixture(String homeTeam, String awayTeam, Integer matchDay, String date, Integer homeTeamGoals, Integer awayTeamGoals, String status) {
		this(homeTeam, awayTeam, matchDay, date, status);
		this.homeTeamGoals = homeTeamGoals;
		this.awayTeamGoals = awayTeamGoals;
	}
	
	public String getId() {
		return id;
	}
	
	public String getHomeTeam() {
		return homeTeam;
	}
	
	public String getAwayTeam() {
		return awayTeam;
	}
	
	public Integer getMatchDay() {
		return matchDay;
	}
	
	public Integer getHomeTeamGoals() {
		return homeTeamGoals;
	}
	
	public Integer getAwayTeamGoals() {
		return awayTeamGoals;
	}
	
	public String getDate() {
		return date;
	}
	
	public String getStatus() {
		return status;
	}
}
