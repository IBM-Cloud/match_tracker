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
