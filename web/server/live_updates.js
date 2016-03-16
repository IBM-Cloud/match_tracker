'use strict'

const EventEmitter = require('events').EventEmitter
const Cloudant = require('cloudant')
const winston = require('winston')

class LiveUpdates extends EventEmitter {
  constructor(credentials, tweets_db) {
    super()
    this.cloudant = Cloudant({account:credentials.username, password:credentials.password})
    this.tweets_db = this.cloudant.db.use(tweets_db)

    const feed = this.tweets_db.follow({since: 'now', include_docs: true})
    feed.on('change', change => this.emit('updates', change.doc))
    feed.on('error', err => {
      winston.error('Errors following live updates:')
      winston.error(err)
    })
    feed.follow()
  }
}

module.exports = LiveUpdates
