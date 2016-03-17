'use strict'
const winston = require('winston')

const MatchTweets = require('./match_tweets.js')
const TweetProcessor = require('./tweet_processor.js')
const Fixtures = require('./fixtures.js')
const MatchEvents = require('./match_events.js')
const LiveUpdates = require('./live_updates.js')

module.exports = (app, io, creds) => {
  const fixtures = new Fixtures(creds, 'fixtures')
  const match_tweets = new MatchTweets(creds, 'match_tweets')
  const live_updates = new LiveUpdates(creds, 'match_tweets')
  const match_events = new MatchEvents(creds)

  const per_second_cache = new Map()

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
      const games = values[0], events = values[1] || []

      events.reduce((previous, next) => previous.concat(next), [])
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

    if (per_second_cache.has(gw_id)) {
      res.json(per_second_cache.get(gw_id))
      return
    }

    const fail = e => {
      winston.error(e)
      res.status(500)
    }

    const success = response => {
      per_second_cache.set(gw_id, response)
      res.json(response)
    }

    gameweek_matches_and_events(gw_id).then(success).catch(fail)
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

  /** hacky way to set dynamic state in the page **/
  app.get('/js/initial_state.js', function (req, res) {
    res.setHeader('content-type', 'text/javascript')

    fixtures.gameweeks_dates().then(dates => {
      let i = 1
      for (; i <= 38; i++) {
        const last_gw_date = Date.parse(dates.get(i)[0])
        if (last_gw_date > Date.now()) {
          break
        }
      }
      res.send(`window.current_gameweek = ${--i};`)
    }).catch(winston.error)
  })
}
