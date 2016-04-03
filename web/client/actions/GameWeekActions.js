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
import Dispatcher from '../dispatcher/Dispatcher'
import Constants from '../constants/Constants'
import request from 'superagent'

let GameWeekActions = {
  paused: false,

  loadGameWeek: function (gameweek) {
    clearInterval(this.interval)
    Dispatcher.dispatch({
      actionType: Constants.GAME_WEEK_CHANGE,
      gameweek: gameweek
    })

    request.get('/api/tweets/gameweek/' + gameweek + '/per_second')
      .end((err, res) => {
        if (err) return console.error(err)
        Dispatcher.dispatch({
          actionType: Constants.GAME_WEEK_LOADED,
          gameweek: gameweek,
          fixtures: res.body.fixtures,
          tweets: res.body.tweets
        })
      })
  },

  replayGameWeek: function () {
    this.startReplay()
    let cursor = 0
    this.interval = setInterval(() => {
      if (this.paused) return

      Dispatcher.dispatch({
        actionType: Constants.GAME_WEEK_UPDATE_CURSOR,
        cursor: cursor
      })
      cursor += 10
      if (cursor > 7200) this.stopReplay()
    }, 100)
  },

  pauseReplay: function () {
    this.paused = true
    Dispatcher.dispatch({
      actionType: Constants.REPLAY_PAUSED
    })
  },

  startReplay: function () {
    this.paused = false
    Dispatcher.dispatch({
      actionType: Constants.REPLAY_LIVE
    })
  },

  stopReplay: function () {
    clearInterval(this.interval)
    Dispatcher.dispatch({
      actionType: Constants.REPLAY_FINISHED
    })
  },

  liveUpdate: function (tweet) {
    Dispatcher.dispatch({
      actionType: Constants.GAME_WEEK_LIVE_UPDATE,
      tweet: tweet
    })
  },

  liveEvents: function (events) {
    Dispatcher.dispatch({
      actionType: Constants.GAME_WEEK_LIVE_EVENTS,
      events: events
    })
  }
}

export default GameWeekActions
