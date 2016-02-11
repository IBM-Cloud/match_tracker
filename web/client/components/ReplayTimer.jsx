import React from 'react'
import classNames from 'classnames'

class ReplayTimer extends React.Component {
  render () {
    const cns = classNames({
      'icon-': true,
      'replay-timer': true,
      'blink_me': this.props.paused
    })
    let minutes = Math.floor(this.props.seconds / 60)
    let seconds_left = this.props.seconds % 60
    if (seconds_left < 10) seconds_left = '0' + seconds_left
    let label = (minutes < 10 ? '0' + minutes : minutes) + ':' + seconds_left

    if (minutes > 45) {
      if (minutes < 60) {
        label = 'HALF-TIME' 
      } else if (minutes > 105) {
        label = 'FULL-TIME' 
      } else {
        minutes -= 15
        label = minutes + ':' + seconds_left
      }
    }

    return (
      <span className={cns}>{label}</span>
    )
  }
}

module.exports = ReplayTimer
