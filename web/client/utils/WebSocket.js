import io from 'socket.io-client'
class WebSocket {
  constructor () {
    this.socket = io()
    this.topic = 'updates'
    this.socket.on('connect', () => {
      console.log('listening to updates');
    })
    this.socket.on('disconnect', () => {
      console.log('disconnected from updates')
    })
  }

  listen () {
    this.socket.on(this.topic, this.listener)
  }

  ignore () {
    this.socket.removeListener(this.listener)
  }

  listener (msg) {
    console.log(msg)
  }
}

const websocket = new WebSocket()

export default websocket
