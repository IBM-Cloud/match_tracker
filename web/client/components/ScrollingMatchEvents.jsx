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
import Constants from '../constants/Constants'

class ScrollingMatchEvents extends React.Component {
  constructor () {
    super()
    this.state = {
      gameweek: -1,
      left: 0
    }

    this.speed = {
      live: 4,
      paused: 0,
      finished: 2
    }
  }

  componentDidMount () {
    this._container_width = this._container.offsetWidth
    this.setState({left: this._container_width})
  }

  componentWillReceiveProps (props) {
    if (this._interval) { 
      cancelAnimationFrame(this._interval)
      this._interval = null
    }

    if (props.gameweek !== this.state.gameweek || props.seconds === 0) {
      this.setState({gameweek: props.gameweek, left: this._container_width})
    } 

    if (props.events.length) {
      this._interval = requestAnimationFrame(() => this.tick())
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.events.length != this.props.events.length) {
      this._scroll_width = this._scrolling.offsetWidth
    }
  }
  
  tick () {
    if (this.state.left <= -this._scroll_width) {
      this.setState({left: this._container_width})
    } else {
      this.setState({left: this.state.left - this.speed[this.props.replay_state]})
    }

    this._interval = requestAnimationFrame(() => this.tick())
  }

  render () {
    const style = {left: this.state.left}
    const events = this.props.events.map((event, index) => { 
      return <span className="event" key={event.min+event.player+event.type}><span className={event.type}></span> {event.min}' <span className="player">{event.player}</span> (<span className="team">{event.team}</span>)</span>
    }) 

    return (
      <div className="container footer marque" ref={(c) => this._container = c}>
        <span className="scrolling_events" style={style} ref={(c) => this._scrolling = c}>
          {events}
        </span>
      </div>
    )
  }
}

module.exports = ScrollingMatchEvents
