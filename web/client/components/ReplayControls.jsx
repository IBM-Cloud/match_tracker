import React from 'react'
import GameWeekActions from '../actions/GameWeekActions'

class ReplayControls extends React.Component {
  onStartClick (event) {
    GameWeekActions.startReplay()
  }

  onPauseClick () {
    GameWeekActions.pauseReplay()
  }

  onStopClick () {
    GameWeekActions.stopReplay()
  }

  render () {
    return (
      <span className="controls">
      <button type="button" onClick={this.onStartClick} className="btn btn-default"> 
        <span className="glyphicon glyphicon-play" aria-hidden="true"></span>
      </button>
      <button type="button" onClick={this.onPauseClick} className="btn space btn-default"> 
        <span className="glyphicon glyphicon-pause" aria-hidden="true"></span>
      </button>
      <button type="button" onClick={this.onStopClick} className="btn space btn-default"> 
        <span className="glyphicon glyphicon-stop" aria-hidden="true"></span>
      </button>
      </span>
    )
  }
}

module.exports = ReplayControls
