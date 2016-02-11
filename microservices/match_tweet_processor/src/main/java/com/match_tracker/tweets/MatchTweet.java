package com.match_tracker.tweets;

import java.util.ArrayList;
import java.util.List;

import com.eclipsesource.json.Json;
import com.eclipsesource.json.JsonArray;
import com.eclipsesource.json.JsonObject;
import com.eclipsesource.json.JsonValue;
import com.eclipsesource.json.ParseException;
import com.google.gson.annotations.SerializedName;

public class MatchTweet {
	@SerializedName("_id") String id; 
	
	protected String body, postedTime, sentiment, locationName = null;
	protected Integer favoritesCount, retweetCount;
	protected List<Float> locationCoords = null;
	protected List<String> hashtags = new ArrayList<String>();
	
	public MatchTweet(String tweetJsonSource) throws ParseException {
		JsonObject source = Json.parse(tweetJsonSource).asObject();
		
		JsonObject message = source.get("message").asObject();
		JsonObject cde = source.get("cde").asObject();
		
		this.id = message.get("id").asString();
		this.body = message.get("body").asString();
		this.postedTime = message.get("postedTime").asString();
		this.retweetCount = message.get("retweetCount").asInt();
		this.favoritesCount = message.get("favoritesCount").asInt();
		
		// Fetch all relevant hashtags
		JsonValue entities = message.get("twitter_entities");
		
		if (entities != null) {
			JsonValue hashtags = entities.asObject().get("hashtags");
			if (hashtags != null) {
				hashtags.asArray().forEach(hashtag -> {
					String label = hashtag.asObject().get("text").asString();
					if (MatchTweetHashtag.isWordValidMatchHashtag(label)) {
						this.hashtags.add(label.toLowerCase());
					}  
				});
			}
		}
		
		
		JsonValue gnip = message.get("gnip");		
		
		if (gnip != null) {
			JsonValue profileLocations = gnip.asObject().get("profileLocations");
			if (profileLocations != null && profileLocations.isArray()) {
				JsonArray profileLocationsArr = profileLocations.asArray();
				if (profileLocationsArr.size() > 0) {								
					JsonObject profileLocation = profileLocationsArr.get(0).asObject();
					this.locationName = profileLocation.get("displayName").asString();
					List<JsonValue> coordinates = profileLocation.get("geo").asObject().get("coordinates").asArray().values();
					locationCoords = new ArrayList<Float>();				
					coordinates.forEach(coord -> locationCoords.add(coord.asFloat()));
				}
			}
		}
		
		if (cde.get("content") != null) {
			this.sentiment = cde.get("content").asObject().get("sentiment").asObject().get("polarity").asString();
		}
	}
	
	public String getId() {
		return id;
	}

	public String getBody() {
		return body;
	}

	public String getPostedTime() {
		return postedTime;
	}

	public String getSentiment() {
		return sentiment;
	}

	public String getLocationName() {
		return locationName;
	}

	public Integer getFavoritesCount() {
		return favoritesCount;
	}

	public Integer getRetweetCount() {
		return retweetCount;
	}

	public List<Float> getLocationCoords() {
		return locationCoords;
	}
	
	public List<String> getHashtags() {
		return hashtags;
	}
}
