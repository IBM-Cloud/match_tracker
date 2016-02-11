package com.match_tracker.fixtures;

import com.google.gson.annotations.SerializedName;

public class Fixture {
	@SerializedName("_id") String id; 
	
	protected String homeTeam, awayTeam;
	protected Integer matchDay, homeTeamGoals, awayTeamGoals;
	protected String date;
	
	public Fixture() {		
	}
	
	public Fixture(String homeTeam, String awayTeam, Integer matchDay, String date) {
		this.id = homeTeam + " v " + awayTeam;
		this.homeTeam = homeTeam;
		this.awayTeam = awayTeam;
		this.matchDay = matchDay;
		this.date = date;
		this.homeTeamGoals = null;
		this.awayTeamGoals = null;
	}
	
	public Fixture(String homeTeam, String awayTeam, Integer matchDay, String date, Integer homeTeamGoals, Integer awayTeamGoals) {
		this(homeTeam, awayTeam, matchDay, date);
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
}
