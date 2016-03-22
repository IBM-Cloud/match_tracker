# Match Tracker Microservices

This directory contains the Java microservices for the Match Tracker project.
To run the microservices locally, follow the steps below to build and run 
from each of the microservices directories.

Before doing this, make sure you have run through the deployments process for
the entire project. This ensures the services you want to bind are available,
along with the environment variables containing credentials.

## Building

<pre>
$ mvn clean
$ mvn assembly:assembly
</pre>

## Running

<pre>
$ eval `cf copyenv <microservice_name>`
$ java -jar -Djava.security.auth.login.config=src/main/resources/jaas.conf target/<microservice_name>-0.0.1-SNAPSHOT-jar-with-dependencies.jar
</pre>

## Loading Previous Data

Loading historial gameweek data can be achieved with the following commands from
the _fixtures_monitor_ service directory.

<pre>
$ eval `cf copyenv fixtures_monitor`
$ mvn clean
$ mvn -Pload-gameweek assembly:assembly
$ java -jar -Djava.security.auth.login.config=src/main/resources/jaas.conf target/<microservice_name>-0.0.1-SNAPSHOT-jar-with-dependencies.jar
</pre>


