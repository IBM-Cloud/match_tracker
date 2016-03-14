'use strict'
const request = require('request')
const cheerio = require('cheerio')
const winston = require('winston')
const moment = require('moment')

class MatchEvents {
  constructor () {
    this.events_cache = new Map()
    this.football_results = 'http://www.bbc.co.uk/sport/football/premier-league/results'
    this.match_events = 'http://www.bbc.co.uk/sport/football/result/partial/'
  }

  _parse_match_events (match) {
    const $ = cheerio.load(match)
    const event = {
      home: $('.team-home a').text().trim(), 
      away: $('.team-away').text().trim()
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

    return {type: type, team: this._convert_team_names(team), player: player.replace('.', '. '), min: min}
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
        return 'Newcastle United FC'
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
}

module.exports = MatchEvents
