'use strict'

const assert = require('assert')
const moment = require('moment')
const LiveEvents = require('../server/live_events.js')

describe('LiveEvents', function() {
  describe('#_match_times_today()', function () {
    it('should match times for the current day', function () {
      const today = (new Date()).toISOString().split('T')[0]
      const matchday_times = (date => {
        assert.equal(date, today)
        return ['11:45:00', '12:45:00', '15:00:00']
      })
      const live_events = new LiveEvents({matchday_times: matchday_times})
      assert.deepEqual(live_events._match_times_today(), ['11:45:00', '12:45:00', '15:00:00'])
    })
  })
  describe('#_seconds_until_start()', function () {
    it('should handle future game times', function () {
      const live_events = new LiveEvents()
      assert.deepEqual(live_events._seconds_until_start('00:00:00', ['12:00:00']), [12 * 60 * 60])
    })
    it('should handle multiple future game times', function () {
      const live_events = new LiveEvents()
      assert.deepEqual(live_events._seconds_until_start('00:00:00', ['11:00:00', '12:00:00', '18:30:30']), [11 * 3600, 12 * 3600, (18 * 3600) + (30 * 60) + 30])
    })
  })
  describe('#_upcoming_match_delays()', function () {
    it('should strip out matches that have already started', function () {
      const live_events = new LiveEvents()
      assert.deepEqual(live_events._upcoming_match_delays('12:00:00', ['01:12:23', '11:59:59', '12:00:00']), [0])
    })
    it('should strip out redundant start times', function () {
      const live_events = new LiveEvents()
      assert.deepEqual(live_events._upcoming_match_delays('12:00:00', ['12:00:00', '12:00:00', '13:00:00', '13:00:00']), [0, 3600])
    })
  })
  describe('#_calculate_match_intervals()', function () {
    it('should work out intervals for future matches', function () {
      const live_events = new LiveEvents()
      assert.deepEqual(live_events._calculate_match_intervals('12:00:00', ['12:00:00']), [[0, 2 * 60 * 60]])
      assert.deepEqual(live_events._calculate_match_intervals('12:00:00', ['13:00:00']), [[3600, 3 * 60 * 60]])
    })
    it('should strip out duplicate intervals', function () {
      const live_events = new LiveEvents()
      assert.deepEqual(live_events._calculate_match_intervals('12:00:00', ['12:00:00', '12:00:00']), [[0, 2 * 60 * 60]])
    })
    it('should strip out intervals for finished matches', function () {
      const live_events = new LiveEvents()
      assert.deepEqual(live_events._calculate_match_intervals('12:00:00', ['10:00:00']), [])
    })
    it('should work out intervals for ongoing matches', function () {
      const live_events = new LiveEvents()
      assert.deepEqual(live_events._calculate_match_intervals('11:00:00', ['10:00:00']), [[0, 3600]])
    })
  })
  describe('#_time_now ()', function () {
    it('should return current time', function () {
      const live_events = new LiveEvents()
      assert.equal(live_events._time_now(), (new Date()).toJSON().substring(11, 19))
    })
  })
  describe('#_should_polling_finish ()', function () {
    it('should finish when moment is before now', function () {
      const live_events = new LiveEvents()
      live_events._events_polling_end = moment().add(1, 'second')
      assert.ok(live_events._should_polling_finish())
    })
    it('should not finish when moment is after now', function () {
      const live_events = new LiveEvents()
      live_events._events_polling_end = moment()
      assert.ok(!live_events._should_polling_finish())
    })
  })

  describe('#_event_poll ()', function () {
    it('should return if polling should finish', function () {
      const live_events = new LiveEvents()
      live_events._should_polling_finish = e => true
      live_events.match_events.live_events = e => assert.ok(false)
      live_events._event_poll()
    })
    it('should broadcast returned events', function (done) {
      const live_events = new LiveEvents()
      live_events.match_events.live_events = () => Promise.resolve([1, 2, 3, 4])
      live_events._should_polling_finish = e => false
      let counter = 1
      live_events.on('live_events', e => {
        assert.equal(counter, e) 
        counter++
        if (counter === 4) done()
      })
      live_events._event_poll()
    })
  })
 
  describe('#_queue_match_timer ()', function () {
    before(function() {
      global.seconds = -1
      global.f = () => {}
      global.setTimeout = (f, s) => {
        global.seconds = s
        f()
      }
    })

    it('should call setTimeout with delay', function () {
      const live_events = new LiveEvents()
      live_events._queue_match_timer([100, 200])
      live_events._start_events_polling = () => {}
      assert.ok(live_events._events_polling_end.isAfter(moment().add(199, 'seconds')))
      assert.ok(live_events._events_polling_end.isBefore(moment().add(201, 'seconds')))
      assert.equal(global.seconds, 100 * 1000)
    })
  })

})
