'use strict'

const assert = require('assert')
const mockery = require('mockery')
const fs = require('fs')
let MatchEvents
let err = null
let body = null
let response = null
let options = null

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

  describe('#parse_match_events', function () {
    it('parse teams from html', function () {
      const match_events = new MatchEvents()
      const match = fs.readFileSync('./tests/resources/match', {encoding: 'utf-8'})
      const result = match_events._parse_match_events(match)
      assert.equal(result.home, 'Tottenham')
      assert.equal(result.away, 'Arsenal')
    })
    it('parse events from html', function () {
      const match_events = new MatchEvents()
      const match = fs.readFileSync('./tests/resources/match', {encoding: 'utf-8'})
      const result = match_events._parse_match_events(match)
      assert.equal(result.events.length, 10)
      assert.deepEqual(result.events[0], {min: '26', player: 'H. Bellerín', team: 'Arsenal FC', 'type': 'booking'})
    })
  })

  describe('#retrieve_results', function () {
    it('should retrieve results', function (done) {
      const match_events = new MatchEvents()
      body = fs.readFileSync('./tests/resources/results', {encoding: 'utf-8'})
      match_events._retrieve_results().then(function (_body) {
        assert.equal(body, _body)
        done()
      })
    })
  })

  describe('#retrieve_match', function () {
    it('should retrieve match html', function (done) {
      const match_events = new MatchEvents()
      body = fs.readFileSync('./tests/resources/match', {encoding: 'utf-8'})
      match_events._retrieve_match('testing').then(function (_body) {
        assert.equal(body, _body)
        assert.equal(options, 'http://www.bbc.co.uk/sport/football/result/partial/testing?teamview=false')
        done()
      })
    })
  })

  describe('#extract_matches', function () {
    it('should turn HTML into matches array', function () {
      const match_events = new MatchEvents()
      const content = fs.readFileSync('./tests/resources/results', {encoding: 'utf-8'})
      const matches = match_events._extract_matches(content)
      assert.equal(Object.keys(matches).length, 71)
      assert.equal(matches['Saturday 8th August 2015'].length, 6)
      assert.deepEqual(matches['Saturday 8th August 2015'], ['EFBO803169', 'EFBO803162', 'EFBO803170', 'EFBO803167', 'EFBO803163', 'EFBO803168'])
    })
  })

  describe('#convert_date_format', function () {
    it('should turn date into date string', function () {
      const match_events = new MatchEvents()
      assert.equal('Saturday 8th August 2015', match_events._convert_date_format('2015-08-08'))
      assert.equal('Sunday 6th March 2016', match_events._convert_date_format('2016-03-06'))
    })
  })

  describe('#for_date()', function () {
    it('should return cached values', function (done) {
      const match_events = new MatchEvents()
      match_events.events_cache.set('match-date', 'match-events')
      match_events.for_date('match-date').then(match_events => {
        assert.equal('match-events', match_events)
        done()
      })
    })
  })
})
