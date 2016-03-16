'use strict'

const winston = require('winston')
const moment = require('moment')

class TweetProcessor {
  constructor (match_times) {
    this.match_times = match_times
  }

  process (tweet) {
    return {sentiment: this._extract_sentiment(tweet), teams: this._extract_teams(tweet), seconds: this._extract_seconds(tweet)}
  }

  _extract_sentiment (doc) {
    switch (doc.sentiment) {
      case 'POSITIVE': 
        return 1
      case 'NEGATIVE': 
        return -1
      default: 
        return 0
    }
  }

  _extract_seconds (doc) {
    const time = doc.postedTime.slice(11, 19)
    const closest_match_start = this.match_times.reduce(
      (prev, current) => (current <= time) ? current: prev
    )
    return moment.duration(time).asSeconds() 
      - moment.duration(closest_match_start).asSeconds()
  }

  _extract_teams (doc) {
    const team_hashtags = [ 'mufc', 'coys', 'afcb', 'avfc', 'efc', 'watfordfc',
      'lcfc', 'safc', 'ncfc', 'cpfc', 'cfc', 'swans', 'nufc', 'saintsfc', 'arsenal',
      'whufc', 'scfc', 'lfc', 'wba', 'mcfc']

      const three_letter_teams = [
        'mun', 'tot', 'bou', 'avl', 'eve', 'wat', 'lei', 'sun', 'nor', 'cry',
        'che', 'swa', 'new', 'sou', 'ars', 'whu', 'stk', 'liv', 'wba', 'mci'
      ]

      const mentioned_teams = []

      doc.hashtags.forEach((ht) => {
        const team_ht = team_hashtags.indexOf(ht)
        if (team_ht !== -1) {
          mentioned_teams.push(team_ht)
        } else if (ht.length === 6){
          const home = three_letter_teams.indexOf(ht.slice(0, 3)), away = three_letter_teams.indexOf(ht.slice(3, 6))
          if (home !== -1 && away !== -1) {
            mentioned_teams.push(home, away)
          }
        }
      })

      return mentioned_teams
  }
}


module.exports = TweetProcessor
