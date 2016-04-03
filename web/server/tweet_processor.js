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
const moment = require('moment')
const teams = require('./teams')

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
          mentioned_teams.push(teams.get(team_ht))
        } else if (ht.length === 6){
          const home = three_letter_teams.indexOf(ht.slice(0, 3)), away = three_letter_teams.indexOf(ht.slice(3, 6))
          if (home !== -1 && away !== -1) {
            mentioned_teams.push(teams.get(home), teams.get(away))
          }
        }
      })

      return [...new Set(mentioned_teams)]
  }
}


module.exports = TweetProcessor
