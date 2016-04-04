/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'
const winston = require('winston')

const MatchTweets = require('./match_tweets.js')
const TweetProcessor = require('./tweet_processor.js')
const Fixtures = require('./fixtures.js')
const MatchEvents = require('./match_events.js')
const LiveUpdates = require('./live_updates.js')
const LiveEvents = require('./live_events.js')

module.exports = (app, io, creds) => {
  const fixtures = new Fixtures(creds, 'fixtures')
  const match_tweets = new MatchTweets(creds, 'match_tweets')
  const live_updates = new LiveUpdates(creds, 'match_tweets')
  const match_events = new MatchEvents(creds)
  const live_events = new LiveEvents(fixtures)

  const per_second_cache = new Map()

  const update_event_cache = (match, gameweek) => {
    if (!per_second_cache.has(gameweek)) {
      return
    }

    const per_second = per_second_cache.get(gameweek)

    const fixture = per_second.fixtures.find(elem => elem.home === match.home && elem.away === match.away)
    if (!fixture) {
      winston.info('Unable to find fixture for match event', match)
      return
    }

    fixture.events = match.events
    const goals = fixture.events.reduce((score, e) => {
      if (e.type.match('goal')) {
        score[e.team === match.home ? 0 : 1]++
      }
      return score
    }, [0, 0])
    fixture.goals = goals

    return fixture
  }

  const update_per_second_cache = (tweet) => {
    if (!per_second_cache.has(tweet.gameweek)) {
      return
    }

    const per_second = per_second_cache.get(tweet.gameweek)
    const fixture_lookup = new Map()
    per_second.fixtures.forEach((f, idx) => {
      fixture_lookup.set(f.home, idx)
      fixture_lookup.set(f.away, idx)
    })

    const fixture_indices = tweet.teams.map(team => fixture_lookup.get(team))
    const fixtures = [...new Set(fixture_indices)]

    const second_tweets = per_second.tweets[tweet.seconds] || {}

    fixtures.forEach(f => {
      const fixture_tweets = second_tweets[f] || [0, 0, 0]
      fixture_tweets[0] += 1
      if (tweet.sentiment === 1) {
        fixture_tweets[1] += tweet.sentiment
      } else if (tweet.sentiment === -1) {
        fixture_tweets[2] += tweet.sentiment
      }

      second_tweets[f] = fixture_tweets
    })

    per_second.tweets[tweet.seconds] = second_tweets
  }

  const gameweek_events = (id) => {
    return fixtures.gameweeks_dates().then(dates => {
      return Promise.all(dates.get(id).map(date => match_events.for_date(date)))
    })
  }

  const gameweek_matches_and_events = (id) => {
    return Promise.all([fixtures.gameweek_matches(id), gameweek_events(id)]).then((values) => {
      const sort_by_home = (a, b) => { return (a.home > b.home) ? 1 : ((b.home > a.home) ? -1 : 0)}
      const games = values[0].sort(sort_by_home), events = values[1] || []

      events.reduce((previous, next) => previous.concat(next), []).sort(sort_by_home)
      .forEach((event, index) => games[index].events = event.events)

      return match_tweets.per_second(games).then((match_seconds) => {
        const tweets = {}
        match_seconds.forEach((value, key) => {
          const matches = {}
          value.forEach((count, team) => {
            matches[team] = [count.total, count.positive, count.negative]
          })
          tweets[key] = matches
        })
        return {fixtures: games, tweets: tweets}
      })
    })
  }

  app.get('/api/tweets/gameweek/:id/per_second', function (req, res) {
    winston.info('Retrieving information for gameweek', req.params.id)
    const gw_id = parseInt(req.params.id, 10)

    if (!per_second_cache.has(gw_id)) {
      winston.info(`Retrieving cache for gameweek ${gw_id}`)
      cache_matches_and_events(gw_id).then(() => {
        res.json(per_second_cache.get(gw_id))
      })
      return
    }

    res.json(per_second_cache.get(gw_id))
  })

  io.on('connection', (socket) => {
    winston.info('user connected to websocket')
  })

  live_updates.on('updates', doc => {
    const date = doc.postedTime.slice(0, 10)
    fixtures.matchday_times(date).then(times_and_gw => {
      const tp = new TweetProcessor(times_and_gw.times)
      const result = tp.process(doc)
      result.gameweek = times_and_gw.gameweek
      update_per_second_cache(result)
      io.emit('updates', result)
    }).catch(winston.error)
  })

  live_events.on('live_events', event => {
    const date = (new Date()).toISOString().slice(0, 10)
    fixtures.matchday_times(date).then(times_and_gw => {
      const update = update_event_cache(event, times_and_gw.gameweek)
      if (!update) {
        winston.info('Missing gameweek in cache.')
        return
      }
      io.emit('events', {events: update, gameweek: times_and_gw.gameweek})
    }).catch(winston.error)
  })

  const cache_matches_and_events = gw => {
    return gameweek_matches_and_events(gw).then(data => {
      per_second_cache.set(gw, data)
    }).catch(error => winston.error(error))
  }

  const get_current_gw = () => {
    return fixtures.gameweeks_dates().then(dates => {
      let i = 1
      for (; i <= 38; i++) {
        const last_gw_date = Date.parse(dates.get(i)[0])
        if (last_gw_date > Date.now()) {
          i--
          break
        }
      }
      return i
    }).catch(winston.error)
  }

  get_current_gw().then(gw => {
    winston.info(`Starting to load gameweek cache from ${gw}...`)
    cache_matches_and_events(gw).then(() => {
      const promises = []
      while (++gw <= 38) {
        promises.push(cache_matches_and_events(gw))
      }
      Promise.all(promises).then(() => {
        winston.info('Finished loading gameweek cache')
        live_events.start()
      }).catch(winston.error)
    })
  })

  /** hacky way to set dynamic state in the page **/
  app.get('/js/initial_state.js', function (req, res) {
    res.setHeader('content-type', 'text/javascript')
    get_current_gw().then(i => res.send(`window.current_gameweek = ${i};`))
  })
}
