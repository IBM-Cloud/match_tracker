import io from 'socket.io-client'
import GameWeekActions from '../actions/GameWeekActions'

class WebSocket {
  constructor () {
    this.socket = io()
    this.tweet_topic = 'updates'
    this.event_topic = 'events'
    this.socket.on('connect', () => {
      console.log('listening to updates')
    })
    this.socket.on('disconnect', () => {
      console.log('disconnected from updates')
    })
  }

  listen () {
    this.socket.on(this.tweet_topic, this.tweet_listener)
    this.socket.on(this.event_topic, this.event_listener)
  }

  ignore () {
    this.socket.removeListener(this.tweet_listener)
    this.socket.removeListener(this.event_listener)
  }

  tweet_listener (msg) {
    console.log(msg)
    GameWeekActions.liveUpdate(msg)
  }

  event_listener (msg) {
    console.log(msg)
    GameWeekActions.liveEvents(msg)
  }
}

const websocket = new WebSocket()

export default websocket
