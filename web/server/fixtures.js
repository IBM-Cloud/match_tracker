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

class Fixtures {
  constructor(credentials, fixtures_db) {
    this.cloudant = Cloudant({account:credentials.username, password:credentials.password})
    this.fixtures_db = this.cloudant.db.use(fixtures_db)

    // if we get updates to the fixtures, clear the cache to trigger a re-built
    const feed = this.fixtures_db.follow({since: 'now', include_docs: true})
    feed.on('change', change => this._clear_cache)
    feed.on('error', err => {
      winston.error('Errors following fixtures updates:')
      winston.error(err)
    })
    feed.follow()

    this.gameweek_dates = new Map()
    this.matchday_times_cache = new Map()
  }

  _clear_cache () {
    this.gameweek_dates.clear()
    this.matchday_times_cache.clear()
  }

  _is_valid_gw(index) {
    return (index > 0 && index <= 38)
  }

  matchday_times (matchday) {
    if (this.matchday_times_cache.has(matchday)) {
      return Promise.resolve(this.matchday_times_cache.get(matchday))
    }

    const result = new Promise((resolve, reject) => {
      this.fixtures_db.view('matches', 'match_dates', {include_docs: true, startkey:matchday, endkey:matchday+"T23:59:59Z"}, (err, body) => {
        if (err) {
          reject('Failed to access db view')
          return
        }

        const times = [...new Set(body.rows.map(row => row.key.slice(11, 19)))]
        const gameweek = body.rows.length ? body.rows[0].doc.matchDay : null
        this.matchday_times_cache.set(matchday, {times: times, gameweek: gameweek})
        resolve({times: times, gameweek: gameweek})
      })
    })
    return result
  }

  gameweek_matches(index) {
    if (!this._is_valid_gw(index)) {
      return Promise.reject('Invalid gameweek')
    }

    const result = new Promise((resolve, reject) => {
      this.fixtures_db.view('matches', 'gameweek_matchdays', {startkey:[index], endkey:[index, {}]}, function(err, body) {
        if (err) {
          reject('Failed to access db view')
          return
        }

        const matches = body.rows.map(row => {
          return {dt: row.key[1], home: row.value[0], away: row.value[1], goals:[row.value[2], row.value[3]]}
        })
        resolve(matches)
      })
    })
    return result

  }

  gameweeks_dates() {
    if (this.gameweek_dates.size > 0) {
      return Promise.resolve(this.gameweek_dates)
    }

    return new Promise((resolve, reject) => {
      this.fixtures_db.view('matches', 'gameweek_days', {reduce: true, group: true}, (err, response) => {
        if (err) {
          reject('Failed to access db view')
        }

        response.rows.forEach((row) => {
          const previous = this.gameweek_dates.get(row.value) || []
          previous.push(row.key)
          this.gameweek_dates.set(row.value, previous)
        })

        resolve(this.gameweek_dates)
      })
    })
  }
}

module.exports = Fixtures
