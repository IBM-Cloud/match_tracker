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
		
		return modified;
	}
}
