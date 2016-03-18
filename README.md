# Match Tracker 

![match tracker](https://dl.dropboxusercontent.com/u/10404736/match-tracker-homepage.png)

Demo app tracking "live" sentiment about football matches from social media.
Handles processing thousands of messages on Twitter about matches in real-time
using a scalable microservice architecture.

Combines Apacke Kafka, Twitter Insights and CouchDB with
Java Microservices and a Node.JS + React frontend web application.

See demo application running [here](http://match-tracker.mybluemix.net/).

## Architecture

![match tracker](https://dl.dropboxusercontent.com/u/10404736/match-tracker-architecture.png)

Fixtures Monitor service tracks the fixtures for upcoming football matches. Each
time a match starts, the services sends a message to a message queue. 

Twitter Search service listens for these messages and start polling for all
mentions of the match using Twitter Insights whilst the match is live. 

Search results are sent to another message queue for processing.

Tweet Processor service parses the incoming search results from the queue and
stores the relevant data in a Cloudant database.

Web Application connects to Cloudant to retrieve summary statistics about
processed tweets during page load. Live updates to the summaries are sent over
a WebSocket to the client.

## Layout

* _microservices_ - java microservices for background processing
* _web_ - node.js + react.js web application
* _scripts_ - deployment scripts

## Deploying

Follow the steps below to deploy this application on IBM Bluemix. You will need
to provision the service instances in the Bluemix console before using the
deployment scripts to automatically build and deploy the microservices and web
app.

### Services

The following services need to be provisioned before deployment using the
Bluemix console.

**The service names must match the table below.**

| Service | Name | 
| ------------- |-------------|
| IBM Message Hub | football_kafka |
| Cloudant | football_cloudant |
| IBM Insights for Twitter | football_twitter |

Save the username and password for the IBM Message Hub and Cloudant
services. These credentials will be required during deployment. 

### Message Queues

The following message queues must be created before deployment through the IBM
Message Hub administration page:

* tweets
* searches

### Build And Deploy

Use the following commands to automatically build and deploy the microservices
and web application. You will need to provide the service credentials for IBM
Message Hub and Cloudant.

<pre>
$ npm install
$ npm run deploy
</pre>

_Deploying all the microservices will take a while, follow the progress using the 
cf logs command-line utility._

You can run the deployment steps individually, see the help guide by running the
following command.

<pre>
$ npm run deploy -- --help
</pre>

## Running Locally

See the individual README.md files in _microservices_ and _web_ directories for details on running
these components locally.

## Loading Previous Gameweeks

Once the application has been deployed, you can manually ingest historical match
data using a command line utility. See the README.md for the _fixtures_monitor_
microservice for details.
