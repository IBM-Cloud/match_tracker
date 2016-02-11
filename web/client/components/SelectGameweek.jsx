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
