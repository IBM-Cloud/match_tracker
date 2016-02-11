'use strict'
const request = require('request')
const winston = require('winston')

class MatchEvents {
  constructor (credentials) {
    this.events_cache = new Map()
    this.football_api = 'http://football-api.com/api/?Action=fixtures'
    this.login_url = 'http://football-api.com/letmein'
    this.ip_url = 'http://football-api.com/wp-admin/admin-ajax.php'
    this.football_api_key = credentials.api_key
    this.football_username = credentials.api_username
    this.football_password = credentials.api_password
  }

  _check_for_error (response) {
    if (response.ERROR !== "OK") {
      const err = new Error('API Response returned error')
      err._response = response
      throw err
    }
  }

  _parse_response (response) {
    const parsed_response = JSON.parse(response)
    this._check_for_error(parsed_response)
    let events = []
    if (parsed_response.matches) {
      events = parsed_response.matches.map(this._parse_match_events)
    }
    return events
  } 

  _parse_and_cache_response (matchdate, response) {
    const events = this._parse_response(response)
    this.events_cache.set(matchdate, events)
    return events
  }

  _parse_match_events (match) {
    const event = {events: [], home: match.match_localteam_name, away: match.match_visitorteam_name}
    if (match.match_events) {
      event.events = match.match_events.map((event) => {
        return {type: event.event_type, team: event.event_team, player: event.event_player, min: event.event_minute}
      })
    }
    return event
  }

  for_date (matchdate) {
    if (this.events_cache.has(matchdate)) {
      return Promise.resolve(this.events_cache.get(matchdate))
    }

    const md = matchdate.split('-').reverse().join('.')
    const url = `${this.football_api}&APIKey=${this.football_api_key}&match_date=${md}`

    return new Promise((resolve, reject) => {
      request(url, (err, response, body) => {
        if (err) {
          winston.error(err)
          return reject(err)
        }
        resolve(body)
      })
    }).then((body) => this._parse_and_cache_response(matchdate, body))
  }

  refresh_auth (ip_address) {
    return new Promise((resolve, reject) => {
      const jar = request.jar()
      const request_cookies = request.defaults({jar: jar})

      request_cookies.post(this.login_url, {form: {log: this.football_username, pwd: this.football_password}}, (err, response) => {
        if (err) {
          return reject(err)
        }

        if (response.statusCode === 302) {
          winston.info('Logged into Football API. Updating ip address to', ip_address)
          const form = {action: 'ipForm_save_ips', ip1: ip_address }
          request_cookies.post(this.ip_url, {form: form}, (err, response) => {
            if (err) {
              return reject(err)
            }
            winston.info('Successfully update Football API IP address.', response.statusCode)
            resolve()
          }) 
        } else {
          reject('Unable to login to Football API.')
        }
      })
    })
  } 
}

module.exports = MatchEvents
