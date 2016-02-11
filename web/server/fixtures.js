'use strict'

const Cloudant = require('cloudant')

class Fixtures {
  constructor(credentials, fixtures_db) {
    this.cloudant = Cloudant({account:credentials.username, password:credentials.password})
    this.fixtures_db = this.cloudant.db.use(fixtures_db)
    this.gameweek_dates = new Map()
  }

  _is_valid_gw(index) {
    return (index > 0 && index <= 38)
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
