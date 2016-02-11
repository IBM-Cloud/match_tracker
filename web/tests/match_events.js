'use strict'

const assert = require('assert')
const mockery = require('mockery')
let MatchEvents
let err = null
let body = null
let response = null
let options = null

const api_key = 'sample'

describe('Match Events', function() {
  before(function() {
    mockery.enable(); // Enable mockery at the start of your test suite
    mockery.warnOnUnregistered(false);
    mockery.registerMock('request', (opts, cb) => {
      options = opts
      setTimeout(() => cb(err, response, body), 0)
    })
    MatchEvents = require('../server/match_events.js')
  })

  after(function() {
    mockery.deregisterMock('request');
    mockery.disable(); // Disable Mockery after tests are completed
  })

  describe('#for_date()', function () {
    it('should return cached values', function (done) {
      const match_events = new MatchEvents({api_key: api_key})
      match_events.events_cache.set('match-date', 'match-events')
      match_events.for_date('match-date').then(match_events => {
        assert.equal('match-events', match_events)
        done()
      })
    })
    it('should return request non-cached values', function (done) {
      const match_events = new MatchEvents({api_key: api_key})
      body = '{}'
      match_events.for_date('2015-01-02').then(match_events => {
        assert.equal('http://football-api.com/api/?Action=fixtures&APIKey=sample&match_date=02.01.2015', options)
        done()
      })
    })
    it('should return parsed respones body', function (done) {
      const match_events = new MatchEvents({api_key: api_key})
      const events = [{event_type: 'type', event_team: 'team', event_player: 'player', event_minute: '1'}]
      body = JSON.stringify({matches: [{match_localteam_name: 'home', match_visitorteam_name: 'away', match_events: events}]})
      match_events.for_date('2015-01-02').then(match_events => {
        assert.equal(match_events.length, 1)
        assert.deepEqual(match_events[0], {home: 'home', away: 'away', events: [{type: 'type', team: 'team', player: 'player', min: '1'}]})
        done()
      })
    })


  })
})
