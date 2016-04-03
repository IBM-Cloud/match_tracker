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
import GameWeekActions from '../actions/GameWeekActions'

class SelectGameweek extends React.Component {
  constructor() {
    super()
    this.state = {
      gameweeks: 38,
      selected: 1
    }
  }
  onChange (event) {
    GameWeekActions.loadGameWeek(event.target.value)
  }

  render () {
    const gws = []
    for(let i = 1; i <= this.state.gameweeks; i++) {
      gws.push(<option key={i} value={i}>{i}</option>)
    }
    return (
      <span className="select-gw">
        <label>Gameweek: </label>
        <select value={this.props.gameweek} className="form-control" onChange={this.onChange}>
          {gws}
        </select>
      </span>
    )
  }
}

module.exports = SelectGameweek
