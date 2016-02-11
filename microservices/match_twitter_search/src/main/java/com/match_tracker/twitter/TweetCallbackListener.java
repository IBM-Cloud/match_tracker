package com.match_tracker.twitter;

import com.eclipsesource.json.JsonObject;

public interface TweetCallbackListener {
	public void onTweet(JsonObject tweet);
}
