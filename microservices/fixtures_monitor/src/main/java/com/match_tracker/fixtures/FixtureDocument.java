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

public class FixtureDocument extends Fixture {

	@SerializedName("_rev") String revision;

	public void setId(String id) {
		this.id = id;
	}

	public String getRevision() {
		return revision;
	}

	public void setRevision(String revision) {
		this.revision = revision;
	}
	
	public void setHomeTeam(String homeTeam) {
		this.homeTeam = homeTeam;
	}

	public void setAwayTeam(String awayTeam) {
		this.awayTeam = awayTeam;
	}

	public void setMatchDay(Integer matchDay) {
		this.matchDay = matchDay;
	}

	public void setHomeTeamGoals(Integer homeTeamGoals) {
		this.homeTeamGoals = homeTeamGoals;
	}

	public void setAwayTeamGoals(Integer awayTeamGoals) {
		this.awayTeamGoals = awayTeamGoals;
	}

	public void setDate(String date) {
		this.date = date;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
	public Boolean update(Fixture fixture) {
		boolean modified = false;
		
		if (!fixture.getDate().equals(date)) {
			date = fixture.getDate();
			modified = true;
		}
		
		if (fixture.getHomeTeamGoals() != homeTeamGoals) {
			homeTeamGoals = fixture.getHomeTeamGoals();
			modified = true;
		}
		
		if (fixture.getAwayTeamGoals() != awayTeamGoals) {
			awayTeamGoals = fixture.getAwayTeamGoals();
			modified = true;
		}
		
		if (!fixture.getStatus().equals(status)) {
			status = fixture.getStatus();
			modified = true;
		}
		
		return modified;
	}
}
