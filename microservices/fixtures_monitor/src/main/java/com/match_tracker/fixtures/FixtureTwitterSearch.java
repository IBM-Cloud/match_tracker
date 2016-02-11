package com.match_tracker.fixtures;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import com.eclipsesource.json.JsonObject;

public class FixtureTwitterSearch {
	protected static String SEARCH_QUERY_TEMPLATE = "((%s AND %s) OR (%s))";
	
	protected static Map<String, String> TEAM_HASHTAG = new HashMap<String, String>(); 
	static {
		TEAM_HASHTAG.put("Manchester United FC", "#MUFC");
		TEAM_HASHTAG.put("Tottenham Hotspur FC", "#COYS");
		TEAM_HASHTAG.put("AFC Bournemouth", "#AFCB");
		TEAM_HASHTAG.put("Aston Villa FC", "#AVFC");
		TEAM_HASHTAG.put("Everton FC", "#EFC");
		TEAM_HASHTAG.put("Watford FC", "#WatfordFC");
		TEAM_HASHTAG.put("Leicester City FC", "#LCFC");
		TEAM_HASHTAG.put("Sunderland AFC", "#SAFC");
		TEAM_HASHTAG.put("Norwich City FC", "#NCFC");
		TEAM_HASHTAG.put("Crystal Palace FC", "#CPFC");
		TEAM_HASHTAG.put("Chelsea FC", "#CFC");
		TEAM_HASHTAG.put("Swansea City FC", "#Swans");
		TEAM_HASHTAG.put("Newcastle United FC", "#NUFC");
		TEAM_HASHTAG.put("Southampton FC", "#SaintsFC");
		TEAM_HASHTAG.put("Arsenal FC", "#Arsenal");
		TEAM_HASHTAG.put("West Ham United FC", "#WHUFC");
		TEAM_HASHTAG.put("Stoke City FC", "#SCFC");
		TEAM_HASHTAG.put("Liverpool FC", "#LFC");
		TEAM_HASHTAG.put("West Bromwich Albion FC", "#WBA");
		TEAM_HASHTAG.put("Manchester City FC", "#MCFC");
	}
	
	protected static Map<String, String> TEAM_THREE_LETTERS = new HashMap<String, String>(); 
	static {
		TEAM_THREE_LETTERS.put("Manchester United FC", "MUN");
		TEAM_THREE_LETTERS.put("Tottenham Hotspur FC", "TOT");
		TEAM_THREE_LETTERS.put("AFC Bournemouth", "BOU");
		TEAM_THREE_LETTERS.put("Aston Villa FC", "AVL");
		TEAM_THREE_LETTERS.put("Everton FC", "EVE");
		TEAM_THREE_LETTERS.put("Watford FC", "WAT");
		TEAM_THREE_LETTERS.put("Leicester City FC", "LEI");
		TEAM_THREE_LETTERS.put("Sunderland AFC", "SUN");
		TEAM_THREE_LETTERS.put("Norwich City FC", "NOR");
		TEAM_THREE_LETTERS.put("Crystal Palace FC", "CRY");
		TEAM_THREE_LETTERS.put("Chelsea FC", "CHE");
		TEAM_THREE_LETTERS.put("Swansea City FC", "SWA");
		TEAM_THREE_LETTERS.put("Newcastle United FC", "NEW");
		TEAM_THREE_LETTERS.put("Southampton FC", "SOU");
		TEAM_THREE_LETTERS.put("Arsenal FC", "ARS");
		TEAM_THREE_LETTERS.put("West Ham United FC", "WHU");
		TEAM_THREE_LETTERS.put("Stoke City FC", "STK");
		TEAM_THREE_LETTERS.put("Liverpool FC", "LIV");
		TEAM_THREE_LETTERS.put("West Bromwich Albion FC", "WBA");
		TEAM_THREE_LETTERS.put("Manchester City FC", "MCI");
	}
	
	protected static DateTimeFormatter UTC_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssX");
	
	protected static String getMatchHashTag(String homeTeam, String awayTeam) {
		return "#" + TEAM_THREE_LETTERS.get(homeTeam) + TEAM_THREE_LETTERS.get(awayTeam);
	}
	
	protected static String getFixtureEndDate(Fixture fixture) {
		ZonedDateTime zdt = ZonedDateTime.parse(fixture.getDate());
		return zdt.plusHours(2).format(UTC_FORMAT);
	}

	protected static String getQueryString(Fixture fixture) {
		return String.format(SEARCH_QUERY_TEMPLATE, TEAM_HASHTAG.get(fixture.getHomeTeam()), TEAM_HASHTAG.get(fixture.getAwayTeam()), 
				getMatchHashTag(fixture.getHomeTeam(), fixture.getAwayTeam()));
	}	
	
	public static JsonObject getSearchJson(Fixture fixture) {
		JsonObject message = new JsonObject();
		message.set("searchQuery", FixtureTwitterSearch.getQueryString(fixture));
		message.set("startTime", fixture.getDate());
		message.set("endTime", FixtureTwitterSearch.getFixtureEndDate(fixture));
		return message;
	}
}