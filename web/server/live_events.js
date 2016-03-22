'use strict'

const EventEmitter = require('events').EventEmitter
const MatchEvents = require('./match_events')
const moment = require('moment')
const winston = require('winston')

class LiveEvents extends EventEmitter {
  constructor (fixtures_db) {
    super()
    this.fixtures_db = fixtures_db
    this._events_polling = null
    this._events_polling_end = null
    this._interval = null
    this.match_events = new MatchEvents()
  }

  start () {
    if (this._interval) this.stop()
    this._poll()
    this._interval = setInterval(() => this._poll, 24 * 60 * 60 * 1000)
  }

  stop () {
    clearInterval(this._interval)
    this._interval = null
  }

  _match_times_today () {
    const today = (new Date()).toISOString().split('T')[0]
    return this.fixtures_db.matchday_times(today)
  }

  _seconds_until_start (start, times) {
    const duration = moment.duration(start).asSeconds()
    return times.map(time => moment.duration(time).asSeconds() - duration)
  }

  _upcoming_match_delays (start, times) {
    return [...new Set(this._seconds_until_start(start, times).filter(seconds => seconds >= 0))]
  }

  _time_now () {
    return (new Date()).toTimeString().split(' ')[0]
  }

  _queue_match_timer (delay_seconds) {
    setTimeout(() => {
      winston.info('Match is live, starting event polling...')
      this._events_polling_end = moment().add(2, 'hours')
      this._start_events_polling()
    }, delay_seconds * 1000)
  }

  _start_events_polling () {
    if (this._events_polling) {
      return
    }

    this._events_polling = setInterval(() => this._event_poll(), 60 * 1000)
  }

  _stop_events_polling () {
    clearInterval(this._events_polling)
    this._events_polling_end = null
    this._events_polling = null
  }

  _should_polling_finish () {
      return this._events_polling_end.isAfter(moment())
  }

  _event_poll () {
    if (this._should_polling_finish()) {
      winston.info('Match events polling has finished.')
      this._stop_events_polling()
      return
    }

    this.match_events.live_events()
      .then(events => events.forEach(e => this.emit('live_events', e)))
      .catch(winston.error)
  }

  _poll () {
    winston.info('Polling for matches live today...')
    this._match_times_today().then(info => {
      winston.info(`Discovered the upcoming match times today: ${info.times}`)
      const time_delays = this._upcoming_match_delays(this._time_now(), info.times)
      time_delays.forEach(delay => this._queue_match_timer)
      winston.info(`Queued ${info.times.length} matches for processing, going back to sleep...`)
    }).catch(winston.error)
  }
}

module.exports = LiveEvents
