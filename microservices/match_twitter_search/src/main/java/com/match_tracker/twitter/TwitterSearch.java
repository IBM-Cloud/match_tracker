package com.match_tracker.twitter;

import java.net.MalformedURLException;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.http.client.HttpClient;
import org.apache.http.client.config.CookieSpecs;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.impl.client.HttpClients;

import com.eclipsesource.json.Json;
import com.eclipsesource.json.JsonObject;
import com.eclipsesource.json.ParseException;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import com.mashape.unirest.request.HttpRequest;

public class TwitterSearch {
	private static final Logger log = Logger.getLogger(TwitterSearch.class.getName());

	protected URL twitterSearchURL;
	
	protected static final String SEARCH_API = "/api/v1/messages/search";	
	protected static final Integer BATCH_SIZE = 100;
	
	protected static final long LONG_SEARCH_THRESHOLD_SECONDS = 60;	
	protected static final long SEARCH_RATE_DELAY_MS = 60 * 1000;
	
	protected static final long SEARCH_START_DELAY_SECONDS = 90;
	protected static final long SEARCH_END_DELAY_SECONDS = 60;	
	protected static final long SEARCH_FAILED_RETRY_DELAY_MS = 60 * SEARCH_RATE_DELAY_MS;
	
	public TwitterSearch(URL twitterSearchAuthUrl) throws MalformedURLException {
		RequestConfig globalConfig = RequestConfig.custom()
		        .setCookieSpec(CookieSpecs.IGNORE_COOKIES)
		        .build();
		HttpClient httpclient = HttpClients.custom()
		        .setDefaultRequestConfig(globalConfig)
		        .build();
		Unirest.setHttpClient(httpclient);
		
		this.twitterSearchURL = new URL(twitterSearchAuthUrl, SEARCH_API);
	}

	public Integer search(String id, String queryString, ZonedDateTime startTime, ZonedDateTime endTime, TweetCallbackListener callback) {
		waitUntilStartIsInThePast(startTime);
		
		ZonedDateTime postedTimeStart = startTime, postedTimeEnd = startTime;		
		LocalDateTime lastLogTime = LocalDateTime.now();
		
		Integer counter = 0;
		
		do {
			postedTimeStart = postedTimeEnd;
			postedTimeEnd = calculatePostedTimeEnd(endTime);
			
			try {
				counter += this.search(constructSearchQuery(queryString, postedTimeStart, postedTimeEnd), callback);
				if (isLongRunningSearch(lastLogTime)) {
					log.log(Level.INFO, "Long-running Twitter search ({0}) has now returned messages: {1}", new Object[]{id, counter});
					lastLogTime = LocalDateTime.now();
				}
				
				sleep(SEARCH_RATE_DELAY_MS);
			} catch (UnirestException e) {
				log.log(Level.WARNING, "Twitter search failed (UnirestException), retrying in sixty seconds. {0}", e.getMessage());
				postedTimeEnd = postedTimeStart;
				sleep(SEARCH_FAILED_RETRY_DELAY_MS);
			} catch (ParseException e) {
				log.log(Level.WARNING, "Twitter search failed (JsonParseException), retrying in sixty seconds. {0}", e.getMessage());
				postedTimeEnd = postedTimeStart;
				sleep(SEARCH_FAILED_RETRY_DELAY_MS);
			}
		} while (!postedTimeEnd.isEqual(endTime));
		
		return counter;
	}
	
	protected Integer search(String queryString, TweetCallbackListener callback) throws UnirestException {		
		Integer offset = 0;
		Integer currentResultsSize = 0;
		
		do {
			log.log(Level.FINE, "Sending Twitter search query: {0} @ {1}", new Object[]{queryString, offset});
			JsonObject results = this.retrieveSearchResults(queryString, offset);			
			results.get("tweets").asArray().forEach(tweet -> callback.onTweet(tweet.asObject()));
			currentResultsSize = results.get("search").asObject().get("current").asInt();			
			offset += currentResultsSize;
			log.log(Level.FINE, "Twitter search ({0}) results: {1}", new Object[]{queryString, offset});
		} while (currentResultsSize > 0);
		
		return offset;
	}
	
	public String constructSearchQuery(String queryString, ZonedDateTime startTime, ZonedDateTime endTime) {	
		DateTimeFormatter ISO_Datetime = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssX");
		return queryString + " " + "posted:" + startTime.format(ISO_Datetime) + "," + endTime.format(ISO_Datetime);
	}
	
	protected void waitUntilStartIsInThePast(ZonedDateTime startTime) {
		long searchDelay = calculateSearchDelay(startTime);
		
		if (searchDelay > 0) {
			log.log(Level.INFO, "Twitter search start in the future, sleeping {1}ms until {0}", 
					new Object[] {startTime.toString(), String.valueOf(searchDelay)});
			sleep(searchDelay);	
		}
	}
	
	protected ZonedDateTime calculatePostedTimeEnd(ZonedDateTime endTime) {
		ZonedDateTime postedTimeEnd = ZonedDateTime.now(ZoneOffset.UTC).minusSeconds(SEARCH_END_DELAY_SECONDS);
		if (postedTimeEnd.isAfter(endTime)) {
			postedTimeEnd = endTime;
		}
		
		return postedTimeEnd;
	}
	
	protected boolean isLongRunningSearch(LocalDateTime lastLogTime) {
		LocalDateTime oneMinuteAgo = LocalDateTime.now().minusSeconds(LONG_SEARCH_THRESHOLD_SECONDS);		
		return oneMinuteAgo.isAfter(lastLogTime);
	}
	
	protected void sleep(long delay) {
		try {
			Thread.sleep(delay);
		} catch (InterruptedException e) {
			log.log(Level.WARNING, "Interrupted TwitterSearch sleep.");
		}	
	}
	
	protected long calculateSearchDelay(ZonedDateTime startTime) {
		long searchDelay = 0;
		
		ZonedDateTime now = ZonedDateTime.now(ZoneOffset.UTC);
		ZonedDateTime offsetStartTime = startTime.plusSeconds(SEARCH_START_DELAY_SECONDS);
		
		if (now.isBefore(offsetStartTime)) {
			 searchDelay = now.until(offsetStartTime, ChronoUnit.MILLIS);
		}
		
		return searchDelay;
	}
	
	protected JsonObject retrieveSearchResults(String queryString, Integer offset) throws UnirestException, ParseException {
		JsonObject results = new JsonObject();
		try {
			HttpResponse<String> response = createHttpRequest(queryString, offset).asString();
			results = Json.parse(response.getBody()).asObject();
		} catch (UnirestException e) {			
			log.log(Level.WARNING, "Failure occurred during Twitter Service API request for queryString: {0}. Exception message: {1}", 
					new Object[] {queryString, e.getMessage()});
		}
		return results;
	}
	
	protected HttpRequest createHttpRequest(String queryString, Integer offset) {		
		return Unirest.get(twitterSearchURL.toString())
			.queryString("size", TwitterSearch.BATCH_SIZE)
			.queryString("from", offset)
			.queryString("q", queryString);
	}
}
