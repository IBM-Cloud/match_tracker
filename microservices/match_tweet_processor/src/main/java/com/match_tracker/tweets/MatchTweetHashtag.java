package com.match_tracker.tweets;

import java.util.HashSet;
import java.util.Set;

public class MatchTweetHashtag {
	protected static Set<String> TEAM_HASHTAGS = new HashSet<String>();
	static {
		TEAM_HASHTAGS.add("MUFC");
		TEAM_HASHTAGS.add("COYS");
		TEAM_HASHTAGS.add("AFCB");
		TEAM_HASHTAGS.add("AVFC");
		TEAM_HASHTAGS.add("EFC");
		TEAM_HASHTAGS.add("WATFORDFC");
		TEAM_HASHTAGS.add("LCFC");
		TEAM_HASHTAGS.add("SAFC");
		TEAM_HASHTAGS.add("NCFC");
		TEAM_HASHTAGS.add("CPFC");
		TEAM_HASHTAGS.add("CFC");
		TEAM_HASHTAGS.add("SWANS");
		TEAM_HASHTAGS.add("NUFC");
		TEAM_HASHTAGS.add("SAINTSFC");
		TEAM_HASHTAGS.add("ARSENAL");
		TEAM_HASHTAGS.add("WHUFC");
		TEAM_HASHTAGS.add("SCFC");
		TEAM_HASHTAGS.add("LFC");
		TEAM_HASHTAGS.add("WBA");
		TEAM_HASHTAGS.add("MCFC");
	}
	
	protected static Set<String> TEAM_THREE_LETTERS = new HashSet<String>(); 
	static {
		TEAM_THREE_LETTERS.add("MUN");
		TEAM_THREE_LETTERS.add("TOT");
		TEAM_THREE_LETTERS.add("BOU");
		TEAM_THREE_LETTERS.add("AVL");
		TEAM_THREE_LETTERS.add("EVE");
		TEAM_THREE_LETTERS.add("WAT");
		TEAM_THREE_LETTERS.add("LEI");
		TEAM_THREE_LETTERS.add("SUN");
		TEAM_THREE_LETTERS.add("NOR");
		TEAM_THREE_LETTERS.add("CRY");
		TEAM_THREE_LETTERS.add("CHE");
		TEAM_THREE_LETTERS.add("SWA");
		TEAM_THREE_LETTERS.add("NEW");
		TEAM_THREE_LETTERS.add("SOU");
		TEAM_THREE_LETTERS.add("ARS");
		TEAM_THREE_LETTERS.add("WHU");
		TEAM_THREE_LETTERS.add("STK");
		TEAM_THREE_LETTERS.add("LIV");
		TEAM_THREE_LETTERS.add("WBA");
		TEAM_THREE_LETTERS.add("MCI");
	}
	
	public static boolean isWordValidMatchHashtag(String word) {
		String upperCaseWord = word.toUpperCase();
		if (TEAM_HASHTAGS.contains(upperCaseWord)) {
			return true;
		}
		
		if (word.length() == 6 && 
				TEAM_THREE_LETTERS.contains(upperCaseWord.substring(0, 3)) && 
				TEAM_THREE_LETTERS.contains(upperCaseWord.substring(3, 6))) {
			return true;
		}
		
		return false;
	}
}
