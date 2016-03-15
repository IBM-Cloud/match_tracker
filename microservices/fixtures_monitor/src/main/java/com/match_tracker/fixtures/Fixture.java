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
