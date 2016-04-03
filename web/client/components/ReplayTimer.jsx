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
