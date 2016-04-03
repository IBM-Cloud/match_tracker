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
const request = require('request')
const cheerio = require('cheerio')
const winston = require('winston')
const moment = require('moment')

class MatchEvents {
  constructor () {
    this.events_cache = new Map()
    this.football_results = 'http://www.bbc.co.uk/sport/football/premier-league/results'
    this.football_live_scores = 'http://www.bbc.co.uk/sport/football/live-scores/premier-league'
    this.match_events = 'http://www.bbc.co.uk/sport/football/result/partial/'
    this.live_events_url = 'http://www.bbc.co.uk/sport/football/live/partial/'
  }

  _parse_match_events (match) {
    const $ = cheerio.load(match)
    const event = {
      home: this._convert_team_names($('.team-home a').text().trim()), 
      away: this._convert_team_names($('.team-away').text().trim())
    }

    event.events = $('.incidents-table tr')
      .map((i, el) => this._parse_match_event_elem(event, $(el))).get()

    return event
  }

  _parse_match_event_elem (event, el) {
    const min = el.find('.incident-time').text().trim().replace('\'', '')
    const type = el.find('.incident-type span').text().trim().toLowerCase() 

    let player = el.find('.incident-player-home').text().trim()
    let team = event.home

    if (!player.length) {
      player = el.find('.incident-player-away').text().trim()
      team = event.away
    } 

    return {type: type, team: team, player: player.replace('.', '. '), min: min}
  } 

  _request (url) {
    return new Promise((resolve, reject) => {
      request(url, (err, response, body) => {
        if (err) {
          winston.error(err)
          return reject(err)
        }
        resolve(body)
      })
    })
  }

  _retrieve_results () {
    return this._request(this.football_results)
  }
  
  _retrieve_live_scores () {
    return this._request(this.football_live_scores)
  }

  _extract_matches (results_page) {
    const $ = cheerio.load(results_page)
    const dates = $('.table-header').map((i, el) => {
      return $(el).text().trim();
    }).get()
    const matches = {}
    $(".stats-body .table-stats").get().forEach((el, i) => {
      matches[dates[i]] = $(el).find('tr.report').map((i, el) => {
        return $(el).attr('id').split('-').pop()
      }).get()
    })
    return matches
  }

  _extract_live_matches (live_scores_page) {
    const $ = cheerio.load(live_scores_page)
    var live_matches = []
    $("#live-scores-table").get().map((el, i) => {
     return $(el).find('tr.panel-showing.live').get().forEach((el, i) => {
        live_matches.push($(el).attr('id').split('-').pop())
      })
    })
    return live_matches
  }

  _convert_date_format (matchdate) {
    return moment(matchdate).format('dddd Do MMMM YYYY') 
  }

  _convert_team_names (team_name) {
    switch(team_name) {
      case 'Bournemouth':
        return 'AFC Bournemouth'
        break
      case 'Sunderland':
        return 'Sunderland AFC'
        break
      case 'Man City':
        return 'Manchester City FC'
        break
      case 'Man Utd':
        return 'Manchester United FC'
        break
      case 'Newcastle':
      case 'West Ham':
        return team_name + ' United FC'
        break
      case 'West Brom':
        return 'West Bromwich Albion FC'
        break
      case 'Tottenham':
        return 'Tottenham Hotspur FC'
        break
      case 'Swansea':
      case 'Leicester':
      case 'Norwich':
      case 'Stoke':
        return team_name + ' City FC'
        break
      default:
        return team_name + ' FC'
    }
  }

  _retrieve_match (id) {
    return this._request(`${this.match_events}${id}?teamview=false`)
  }

  _retrieve_live_match (id) {
    return this._request(`${this.live_events_url}${id}`)
  }

  for_date (matchdate) {
    if (this.events_cache.has(matchdate)) {
      return Promise.resolve(this.events_cache.get(matchdate))
    }

    return this._retrieve_results().then(this._extract_matches).then(matches => {
      const matchdate_matches = matches[this._convert_date_format(matchdate)] || []
      const matchdate_events = matchdate_matches.map((match_id) => {
        return this._retrieve_match(match_id).then((result) => this._parse_match_events(result))
      })

      return Promise.all(matchdate_events).then(resolved => {
        if (resolved.length) {
          this.events_cache.set(matchdate, resolved)
        }
        return resolved
      })
    })
  }

  live_events () {
    return this._retrieve_live_scores().then(this._extract_live_matches).then(matches => {
      const pme = result => this._parse_match_events(result)
      return Promise.all(matches.map(match => this._retrieve_live_match(match).then(pme)))
    })
  }
}

module.exports = MatchEvents
