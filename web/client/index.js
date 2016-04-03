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
import React from 'react'
import ReactDOM from 'react-dom'
import Table from './components/Table'
import GameweekStats from './components/GameweekStats'
import Header from './components/Header'
import ScrollingMatchEvents from './components/ScrollingMatchEvents'
import LoadingModal from './components/LoadingModal'
import Gameweek from './stores/Gameweek'
import GameWeekActions from './actions/GameWeekActions'
import WebSocket from './utils/WebSocket'

GameWeekActions.loadGameWeek(window.current_gameweek)

class MatchTracker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      message_counts: [],
      gameweek: this.props.gameweek,
      replay_state: Gameweek.getReplayState(),
      events: [],
      seconds: 7200,
      loading: true
    }
    this._onChange = e => this.setState({
      message_counts: Gameweek.getMatchTweetsTable(),
      gameweek: Gameweek.getIndex(),
      replay_state: Gameweek.getReplayState(),
      seconds: Gameweek.getCursor(),
      events: Gameweek.getMatchEvents(),
      loading: Gameweek.getLoading()
    })
  }

  componentDidMount () {
    Gameweek.addChangeListener(this._onChange)
    WebSocket.listen()
  }

  componentWillUnmount () {
    Gameweek.removeChangeListener(this._onChange)
    WebSocket.ignore()
  }

  render () {
    return (
      <div>
        <Header seconds={this.state.seconds} gameweek={this.state.gameweek} replay_state={this.state.replay_state}/>
        <div className="container main">
          <Table id="table-container" data={this.state.message_counts}/>
          <GameweekStats data={this.state.message_counts}/>
        </div>
        <ScrollingMatchEvents replay_state={this.state.replay_state} gameweek={this.state.gameweek} seconds={this.state.seconds} events={this.state.events}/>
        <LoadingModal loading={this.state.loading}/>
      </div>
    )
  }
}

ReactDOM.render(
  <MatchTracker gameweek={window.current_gameweek}/>,
  document.getElementById('root')
)
