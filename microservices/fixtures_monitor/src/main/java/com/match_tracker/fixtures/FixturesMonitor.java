package com.match_tracker.fixtures;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.eclipsesource.json.JsonObject;

public class FixturesMonitor {

	private static final Logger log = Logger.getLogger(FixturesMonitor.class.getName());
	
	protected final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
	protected final FixtureTweetRunnable runnable;
	
	protected final FixturesDB fixturesDB;	
	protected Properties kafkaProperties;
	
	FixturesMonitor(FixturesDB fixturesDB, Properties kafkaProperties) {		
		this.fixturesDB = fixturesDB;
		this.runnable = new FixtureTweetRunnable(kafkaProperties);
	}
	
	protected void start() {
		if (fixturesDB.isInitialized()) {
			scheduleNextTwitterSearch();
		}
		scheduleFixturesUpdateCheck();
	}
	
	protected void scheduleNextTwitterSearch() {
		runnable.schedule();
	}
	
	protected void scheduleFixturesUpdateCheck() { 
		final Runnable task = new Runnable() {
			protected FixturesService fixturesService = new FixturesService();
			
	        @Override
	        public void run() {
	            log.log(Level.INFO, "Checking for updated fixtures...");
	            
				try {
					boolean isInitialised = fixturesDB.isInitialized();
		            fixturesDB.update(fixturesService.getFixtures());
		            log.log(Level.INFO, "Finished updating fixtures.");
		            
		            if (!isInitialised) {
		            	scheduleNextTwitterSearch();
		            }
				} catch (RemoteServiceUnavailable e) {
					log.log(Level.WARNING, "Failed to update fixtures due to service failure. Retrying in twenty four hours.");
				}
	        }
	    };
		
	    scheduler.scheduleAtFixedRate(task, 0, 24, TimeUnit.HOURS);
	}
	
	private class FixtureTweetRunnable implements Runnable {			
		protected List<FixtureDocument> upcomingFixtures;		
		protected FixtureSearchProducer producer;
		
		public FixtureTweetRunnable(Properties kafkaProperties) {
			this.producer = new FixtureSearchProducer(kafkaProperties);
		}
		
        @Override
        public void run() {
        	log.log(Level.INFO, "Ready to send {0} Twitter searches.", upcomingFixtures.size());
        	upcomingFixtures.forEach(fixture -> {
        		System.out.println();
        		log.log(Level.INFO, "Sending Twitter Search: {0}", fixture.getId() + " @ " + fixture.getDate());
        		JsonObject searchQuery = FixtureTwitterSearch.getSearchJson(fixture);
        		producer.send(fixture.getId(), searchQuery.toString());
        		log.log(Level.INFO, "Finished sending Twitter Search: {0}", fixture.getId() + " @ " + fixture.getDate());        		
        	});
        	
        	schedule();
        }
        
        public void schedule() {
        	updateUpcomingFixtures();
        	Long delayUntilFixture = millisecondsUntilNextFixture();
        	log.log(Level.INFO, "FixtureTweetRunnable sleeping until {0}", LocalDateTime.now().plus(delayUntilFixture, ChronoUnit.MILLIS));
        	scheduler.schedule(this, delayUntilFixture, TimeUnit.MILLISECONDS);
        }
        
        protected Long millisecondsUntilNextFixture() {
        	String dateStr = upcomingFixtures.get(0).getDate();
        	ZonedDateTime fixtureDt = ZonedDateTime.parse(dateStr);
        	return LocalDateTime.now().until(fixtureDt, ChronoUnit.MILLIS);	
        }
        
        protected void updateUpcomingFixtures() {
        	log.log(Level.INFO, "Updating upcoming fixtures...");
        	upcomingFixtures = fixturesDB.retrieveNextFixtures();
        	log.log(Level.INFO, "Found " + upcomingFixtures.size() + " fixtures @ " + upcomingFixtures.get(0).getDate());
        }
    };
}
