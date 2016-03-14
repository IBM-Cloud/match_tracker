'use strict'
const winston = require('winston')

const MatchTweets = require('./match_tweets.js')
const Fixtures = require('./fixtures.js')
const MatchEvents = require('./match_events.js')

module.exports = (app, creds) => {
  const fixtures = new Fixtures(creds, 'fixtures')
  const match_tweets = new MatchTweets(creds, 'match_tweets')
  const match_events = new MatchEvents(creds)

  const per_second_cache = new Map()

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

  /** hacky way to set dynamic state in the page **/
  app.get('/js/initial_state.js', function(req, res) {
    res.setHeader('content-type', 'text/javascript');

    fixtures.gameweeks_dates().then(dates => {
      let i = 1
      for (; i <= 38; i++) {
        const last_gw_date = Date.parse(dates.get(i).slice(-1))
        if (last_gw_date > Date.now()) {
          break
        }
      }
      res.send(`window.current_gameweek = ${--i};`);
    }).catch(winston.error)
  })
}
