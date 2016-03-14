import { EventEmitter } from 'events';
import Dispatcher from '../dispatcher/Dispatcher'
import Constants from '../constants/Constants'

const CHANGE_EVENT = 'change'

class Gameweek extends EventEmitter {
  constructor () {
    super()
    this.index = -1
    this.loading = true;
    this.fixtures = []
    this.tweets = {}
    this.table = []
    this.cursor = 0
    this.replay_state = "finished"
  }

  load (index, fixtures, tweets) {
    this.loading = false
    this.index = index
    this.fixtures = fixtures
    this.tweets = tweets
    this.cursor = 7200
    const match_tweets = this._getMatchTweets(0, this.cursor)
    this.table = this.calculateTable(match_tweets)
    this.replay_state = "finished"
  }

  setLoading(loading) {
    this.loading = loading
  }

  getLoading () {
    return this.loading
  }

  setReplayState (replay_state) {
    this.replay_state = replay_state
  }

  getReplayState () {
    return this.replay_state
  }

  getIndex () {
    return this.index
  }

  getMatchTweetsTable () {
    return this.table.sort((a, b) => b.total - a.total)
  }

  getMatchEvents () {
    const match_events = this.fixtures.map(f => {
      return (f.events || []).map(e => {
        return {
          team: e.team,
          min: parseInt(e.min, 10),
          type: e.type,
          player: e.player
        }
      })
    }).reduce((previous, next) => previous.concat(next)).filter(e => {
      return ((e.min > 45 ? e.min + 15 : e.min) * 60) < this.cursor
    }).sort((a, b) => a.min - b.min)

    return match_events
  }

  calculateTable (fixture_tweet_counts) {
    const tweets_table = []
    fixture_tweet_counts.forEach((counts, fixture) => {
      tweets_table.push({home_goals: counts.home_goals, away_goals: counts.away_goals, total: counts.total, positive: counts.positive, 
        negative: counts.negative, home: fixture.home, away: fixture.away})
    })
    return tweets_table
  }

  getCursor () {
    return this.cursor
  }

  updateCursor (cursor) {
    if (cursor === this.cursor) return

    if (cursor < this.cursor) {
      const match_tweets = this._getMatchTweets(0, cursor)
      this.table = this.calculateTable(match_tweets)
    } else {
      const match_tweets = this._getMatchTweets(this.cursor + 1, cursor)
      const offset_table = this.calculateTable(match_tweets)
      offset_table.forEach(details => {
        const previous = this.table.find(item => (item.home === details.home && item.away === details.away))
        if (previous) {
          previous.total += details.total
          previous.positive += details.positive
          previous.negative += details.negative
          previous.home_goals += details.home_goals
          previous.away_goals += details.away_goals
        } else {
          this.table.push(details)
        }
      })
    }

    this.cursor = cursor
  }

  _getMatchTweets (start, end) {
    const counts = new Map()
    this.fixtures.forEach(f => {
      let home_goals = 0, away_goals = 0;
      (f.events || []).forEach(event => {
        let event_minute = parseInt(event.min, 10)
        if (event_minute > 45) {
          event_minute += 15
        }
        const event_second = event_minute * 60
        if (event.type === "goal" && start <= event_second && event_second <= end) {
          if (event.team === f.home) {
            home_goals++
          } else {
            away_goals++
          }
        }
      })
      counts.set(f, {total: 0, positive: 0, negative: 0, home_goals: home_goals, away_goals: away_goals})
    })
    while (start <= end) {
      for (let idx in this.tweets[start]) {
        const previous = counts.get(this.fixtures[idx])
        previous.total += this.tweets[start][idx][0]
        previous.positive += this.tweets[start][idx][1]
        previous.negative -= this.tweets[start][idx][2]
      }
      start++
    }
    return counts
  }

  emitChange () {
    this.emit(CHANGE_EVENT)
  }

  addChangeListener (callback) {
    this.on(CHANGE_EVENT, callback)
  }

  removeChangeListener (callback) {
    this.removeListener(CHANGE_EVENT, callback)
  }
}

let gameweek = new Gameweek()

Dispatcher.register(action => {
  switch (action.actionType) {
    case Constants.GAME_WEEK_CHANGE:
      gameweek.setLoading(true)
      gameweek.emitChange()
      break
    case Constants.GAME_WEEK_LOADED:
      gameweek.load(action.gameweek, action.fixtures, action.tweets)
      gameweek.emitChange()
      break
    case Constants.GAME_WEEK_UPDATE_CURSOR:
      gameweek.updateCursor(action.cursor)
      gameweek.emitChange()
      break
    case Constants.REPLAY_LIVE:
      gameweek.setReplayState('live')
      gameweek.emitChange()
      break
    case Constants.REPLAY_PAUSED:
      gameweek.setReplayState('paused')
      gameweek.emitChange()
      break
    case Constants.REPLAY_FINISHED:
      gameweek.setReplayState('finished')
      gameweek.updateCursor(7200)
      gameweek.emitChange()
      break
  }
})

export default gameweek
