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

const Cloudant = require('cloudant')
const Teams = require('./teams.js')

class MatchTweets {
  constructor(credentials, tweets_db) {
    this.cloudant = Cloudant({account:credentials.username, password:credentials.password})
    this.tweets_db = this.cloudant.db.use(tweets_db)
  }

  retrieve (start, end) {
    const result = new Promise((resolve, reject) => {
      this.tweets_db.view('matches', 'performance', {startkey:start, endkey:this._end_key(end)}, function(err, body) {
        if (err) {
          reject('Failed to access db view')
          return
        }

        resolve(body.rows)
      })
    })
    return result
  }
  
  per_second(fixtures) {
    return new Promise((resolve, reject) => {
      const fixtures_window = this._fixtures_window(fixtures)
      this.retrieve(fixtures_window[0], fixtures_window[1]).then((tweets) => {
        const match_seconds = new Map()
        const sort_by_dt = (a, b) => { return (a.dt > b.dt) ? 1 : ((b.dt > a.dt) ? -1 : 0)}
        const processor = this._fixture_second_processor(fixtures.sort(sort_by_dt))
        const lookup = this._fixture_lookup(fixtures)
        tweets.forEach(tweet => {
          const sentiment = tweet.value[1]
          const fixture_mentions = new Set(tweet.value[0].map(team => lookup.get(Teams.get(team))))
          const offset = processor(tweet.key)
          if (!match_seconds.has(offset)) {
            match_seconds.set(offset, new Map())
          }
          const second_tweets = match_seconds.get(offset)
          fixture_mentions.forEach(mention => {
            const counts = second_tweets.get(mention) || {total: 0, positive: 0, negative: 0}
            counts.total++
            if (sentiment === 1) {
              counts.positive++
            } else if (sentiment === -1) {
              counts.negative--
            }
            second_tweets.set(mention, counts)
          })
        })
        resolve(match_seconds)
      }).catch(e => { console.error(e); reject(e)})
    })
  }

  _fixture_lookup(fixtures) {
    const lookup = new Map()
    fixtures.forEach((fixture, index) => {
      lookup.set(fixture.home, index)
      lookup.set(fixture.away, index)
    })
    return lookup
  }

  _fixture_second_processor(fixtures) {
    let offset = 0
    return (dt) => {
      let seconds_from = -1
      let fixture = fixtures[offset + 1]
      while(fixture && this._after(dt, fixture.dt)) { 
        offset++
        fixture = fixtures[offset + 1]
      }

      if (fixtures[offset]) {
        seconds_from = this._seconds_from(fixtures[offset].dt, dt)
      }

      return seconds_from
    }
  }

  _after(after, before) {
    return Date.parse(after) >= Date.parse(before)
  }

  _seconds_from(start, offset) {
    const ms_between = Date.parse(offset) - Date.parse(start)
    return (ms_between / 1000)
  }

  _fixtures_window(fixtures) {
    const sorted = fixtures.map(fixture => fixture.dt.split('T')[0]).sort()
    return [sorted[0], sorted.pop()]
  }

  _end_key (end) {
    const ms_per_day = 24 * 60 * 60 * 1000
    const next_day = new Date(Date.parse(end) + ms_per_day)
    return next_day.toISOString().split('T')[0]
  } 
}

module.exports = MatchTweets
