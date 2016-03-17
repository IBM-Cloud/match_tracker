package com.match_tracker.fixtures;

import java.io.IOException;
import java.util.Properties;
import java.util.StringJoiner;
import java.util.concurrent.ExecutionException;

import com.eclipsesource.json.Json;
import com.eclipsesource.json.JsonArray;
import com.eclipsesource.json.JsonObject;

/* 
 * Simple static utility class to load previous game weeks and fixtures
 */

public class FixtureLoadGameweek {

	public static final String KAFKA_PROPS = "/kafka.properties";
	public static final String SEARCHES_TOPIC = "twitter_search_topic";	
	public static final String KAFKA_SERVICE = "messagehub";
	public static final String CLOUDANT_SERVICE = "cloudantNoSQLDB";
	
	public static void loadGameWeek(FixtureSearchProducer producer, FixturesDB fixturesDB, String gameWeek) {
		System.out.println("Searching for the following gameweek fixtures: " + gameWeek);
		fixturesDB.retrieveAll().forEach(document -> {			
			if (document.getMatchDay() == Integer.parseInt(gameWeek)) {
				System.out.println("Sending Twitter Search: " + document.getId() + " @ " + document.getDate());
        		JsonObject searchQuery = FixtureTwitterSearch.getSearchJson(document);
        		producer.send(document.getId(), searchQuery.toString());
        		System.out.println("Finished sending Twitter Search: " + document.getId() + " @ " + document.getDate());
			}
		});

	}
	
	public static void loadFixture(FixtureSearchProducer producer, FixturesDB fixturesDB, String fixture) {
		System.out.println("Searching for the following fixture: " + fixture);
		fixturesDB.retrieveAll().forEach(document -> {
			if (document.getId().equals(fixture)) {
				System.out.println("Retrieve database fixture document.");
				System.out.println("Sending Twitter Search: " + document.getId() + " @ " + document.getDate());
        		JsonObject searchQuery = FixtureTwitterSearch.getSearchJson(document);
        		producer.send(document.getId(), searchQuery.toString());
        		System.out.println("Finished sending Twitter Search: " + document.getId() + " @ " + document.getDate());
			}
		});
	}
	
	public static void main(String[] args) throws InterruptedException, ExecutionException {
		System.out.println("Gameweek and Fixture Loading Tool.");
		
		if (args.length != 1) {
			System.err.println("Invalid number of arguments, should be either --gameweek=1 or --fixture=\"Home v Away\"");
			System.exit(1);
		}
		
		String argument = args[0];		
		int split = argument.indexOf('=');

		if (split == -1) {
			System.err.println("Invalid argument format, should be either --gameweek=1 or --fixture=\"Home v Away\"");
			System.exit(1);
		}
		
		String key = argument.substring(0, split);
		String value = argument.substring(split + 1, argument.length());
		
		Properties kakfkaProps = new Properties();

		try {
		    // load a properties file
			kakfkaProps.load(FixturesMonitorService.class.getResourceAsStream(KAFKA_PROPS));
		} catch (IOException ex) {
			System.err.println("Unable to read Kafka properties");
			System.exit(-1);
		}
		
		String VCAP_SERVICES = System.getenv("VCAP_SERVICES");
		if (VCAP_SERVICES == null) {
			System.out.println("Unable to read VCAP_SERVICES.");
			throw new RuntimeException("Unable to read VCAP_SERVICES");
		}
		
		JsonObject vcapServices = Json.parse(VCAP_SERVICES).asObject();		
		JsonObject cloudantService = vcapServices.get(CLOUDANT_SERVICE).asArray().get(0).asObject();
		JsonObject cloudantCreds = cloudantService.get("credentials").asObject();
		
		Properties cloudantProps = new Properties();
		cloudantProps.setProperty("host", cloudantCreds.get("host").asString());
		cloudantProps.setProperty("port", String.valueOf(cloudantCreds.get("port").asInt()));
		cloudantProps.setProperty("username", cloudantCreds.get("username").asString());
		cloudantProps.setProperty("password", cloudantCreds.get("password").asString());
		
		JsonObject kakfaService = vcapServices.get(KAFKA_SERVICE).asArray().get(0).asObject();		
		JsonArray kafkaBrokers = kakfaService.get("credentials").asObject().get("kafka_brokers_sasl").asArray();
		
		StringJoiner brokerListJoiner = new StringJoiner(",");				 
		kafkaBrokers.forEach(action -> brokerListJoiner.add(action.asString()));
		kakfkaProps.setProperty("bootstrap.servers", brokerListJoiner.toString());
		
		System.out.println(brokerListJoiner.toString());
		
		FixturesDB fixturesDB = new FixturesDB(cloudantProps);
		
		FixtureSearchProducer producer = new FixtureSearchProducer(kakfkaProps);
		
		switch(key) {
		case "--gameweek":
			System.out.println("Loading gameweek " + value);
			loadGameWeek(producer, fixturesDB, value);
			break;
		case "--fixture":
			System.out.println("Loading fixture " + value);
			loadFixture(producer, fixturesDB, value);
			break;
		default:
			System.err.println("Unknown argument, should be either --gameweek=1 or --fixture=\"Home v Away\"");
			System.exit(1);
			break;
		}
	}

}
