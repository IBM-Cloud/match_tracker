import React from 'react'
import GameWeekActions from '../actions/GameWeekActions'

class LiveReplay extends React.Component {
  onClick (event) {
    GameWeekActions.replayGameWeek()
  }

  render () {
    return (
      <button type="button" onClick={this.onClick} className="replay btn btn-default">
      <span className="glyphicon glyphicon-repeat" aria-hidden="true"></span>
      Replay
      </button>
    )
  }
}

module.exports = LiveReplay
