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
import SelectGameweek from './SelectGameweek'
import LiveReplay from './LiveReplay'
import ReplayTimer from './ReplayTimer'
import ReplayControls from './ReplayControls'
import classNames from 'classnames'

class Header extends React.Component {
  render () {
    let right_control = <ReplayControls/>,
      left_control = <ReplayTimer seconds={this.props.seconds} paused={this.props.replay_state === 'paused'}/>

    if (this.props.replay_state === 'finished') {
      left_control = <LiveReplay/>
      right_control = <SelectGameweek gameweek={this.props.gameweek}/>
    }

    return (
      <nav className="navbar navbar-inverse navbar-fixed-top">
        <div className="container">
          <div className="navbar-header">
            <a className="navbar-brand title" href="#"> ⚽  Match Tracker</a>
          </div>
          <div id="navbar" className="collapse navbar-collapse">
            <form className="navbar-form navbar-right">
              {left_control}
              {right_control}
            </form>
          </div>
        </div>
      </nav>
    )
  }
}

module.exports = Header
