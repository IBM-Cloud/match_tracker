'use strict'

const assert = require('assert')
const MatchTweets = require('../server/match_tweets.js')
const Fixtures = require('../server/fixtures.js')

const me = 'me'
const password = 'me'

describe('MatchTweets', function() {
  describe('#_end_key()', function () {
    it('should calculate the next day', function () {
      const match_tweets = new MatchTweets({username: me, password: password}, 'match_tweets')
      assert.equal(match_tweets._end_key('2015-01-01'), '2015-01-02')
      assert.equal(match_tweets._end_key('2015-02-28'), '2015-03-01')
      assert.equal(match_tweets._end_key('2015-12-31'), '2016-01-01')
    })
  })
  describe('#_after', function () {
    const match_tweets = new MatchTweets({username: me, password: password}, 'match_tweets')
    it('should match after dates', function () {
      assert.ok(match_tweets._after('2015-01-01T00:00:01Z', '2015-01-01T00:00:01Z'))
      assert.ok(match_tweets._after('2015-01-01T00:00:02Z', '2015-01-01T00:00:01Z'))
      assert.ok(match_tweets._after('2016-01-01T00:00:00Z', '2015-01-01T00:00:01Z'))
    })
    it('should not match before dates', function () {
      assert.ok(!match_tweets._after('2015-01-01T00:00:00Z', '2015-01-01T00:00:01Z'))
      assert.ok(!match_tweets._after('2014-01-01T00:00:00Z', '2015-01-01T00:00:01Z'))
    })
  })
  describe('#_seconds_from', function () {
    const match_tweets = new MatchTweets({username: me, password: password}, 'match_tweets')
    it('should calculate seconds between dates', function () {
      assert.equal(match_tweets._seconds_from('2015-01-01T00:00:00Z', '2015-01-01T00:00:01Z'), 1)
      assert.equal(match_tweets._seconds_from('2015-01-01T00:00:00Z', '2015-01-01T00:01:00Z'), 60)
    })
  })
  describe('#_fixture_second_processor()', function () {
    const match_tweets = new MatchTweets({username: me, password: password}, 'match_tweets')
    it('should process a single fixture', function () {
      const process = match_tweets._fixture_second_processor([{dt: '2015-01-01T00:00:00Z'}])
      assert.equal(process('2015-01-01T00:01:00Z'), 60)
    })
    it('should process multiple fixtures', function () {
      const process = match_tweets._fixture_second_processor([{dt: '2015-01-01T00:00:00Z'}, {dt: '2015-01-01T00:01:00Z'}])
      assert.equal(process('2015-01-01T00:00:59Z'), 59)
      assert.equal(process('2015-01-01T00:01:00Z'), 0)
      assert.equal(process('2015-01-01T00:02:00Z'), 60)
      assert.equal(process('2015-01-01T00:03:00Z'), 120)
    })
  })
  describe('#_fixtures_window()', function () {
    const match_tweets = new MatchTweets({username: me, password: password}, 'match_tweets')
    it('should return fixture start and end dates', function () {
      let window = match_tweets._fixtures_window([{dt: '2015-01-01T00:00:00Z'}, {dt: '2015-01-02T00:00:00Z'}])
      assert.deepEqual(window, ['2015-01-01', '2015-01-02'])
      window = match_tweets._fixtures_window([{dt: '2016-01-01T00:00:00Z'}, {dt: '2005-01-01T00:00:00Z'}, {dt: '2015-01-02T00:00:00Z'}])
      assert.deepEqual(window, ['2005-01-01', '2016-01-01'])
    })
  })
  describe('#retrieve()', function () {
    it('should reject db errors find match tweets', function (done) {
      const match_tweets = new MatchTweets({username: me, password: password}, 'match_tweets')
      match_tweets.tweets_db.view = (db, view, opts, cb) => cb(true)
      match_tweets.retrieve().catch(e => done())
    })
    it('should resolve db results', function (done) {
      const match_tweets = new MatchTweets({username: me, password: password}, 'match_tweets')
      match_tweets.tweets_db.view = (db, view, opts, cb) => cb(false, {rows:[1,2,3,4]})
      match_tweets.retrieve(100, 200).then(e => {
        assert.deepEqual(e, [1,2,3,4])
        done()
      })
    })
  })
  describe('#per_second()', function () {
    it('should handle empty tweets', function (done) {
      const match_tweets = new MatchTweets({username: me, password: password}, 'match_tweets')
      match_tweets.retrieve = (start, end) => {
        return Promise.resolve([])
      }
      match_tweets.per_second([]).then(results => {
        assert.equal(results.size, 0)
        done()
      })
    })
  })
  it('should handle multiple match tweets', function (done) {
    const match_tweets = new MatchTweets({username: me, password: password}, 'match_tweets')
    match_tweets.retrieve = (start, end) => {
      return Promise.resolve([])
    }
    match_tweets.per_second([]).then(results => {
      assert.equal(results.size, 0)
      done()
    })
  })
})
