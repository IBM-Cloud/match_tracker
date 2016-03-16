'use strict'

const assert = require('assert')
const Fixtures = require('../server/fixtures.js')

const me = 'sample'
const password = 'sample'

describe('Fixtures', function() {
  describe('#_is_valid_gameweek()', function () {
    it('should validate normal gameweeks index', function () {
      const fixtures = new Fixtures({username: me, password: password}, 'fixtures')
      assert.ok(fixtures._is_valid_gw(1))
      assert.ok(fixtures._is_valid_gw(10))
      assert.ok(fixtures._is_valid_gw(30))
      assert.ok(fixtures._is_valid_gw(38))
    })
    it('should ignore non-valid gameweeks', function () {
      const fixtures = new Fixtures({username: me, password: password}, 'fixtures')
      assert.ok(!fixtures._is_valid_gw(0))
      assert.ok(!fixtures._is_valid_gw(-1))
      assert.ok(!fixtures._is_valid_gw(39))
    })
  })
  describe('#gameweek_matches()', function (done) {
    it('should resolve invalid gameweeks to error', function () {
      const fixtures = new Fixtures({username: me, password: password}, 'fixtures')
      fixtures.gameweek_matches(0).catch(e => done())
    })
    it('should reject on db errors', function (done) {
      const fixtures = new Fixtures({username: me, password: password}, 'fixtures')
      fixtures.fixtures_db.view = (db, view, opts, cb) => {cb(true)}
      fixtures.gameweek_matches(1).catch(e => done())
    })
    it('should return db view results', function (done) {
      const fixtures = new Fixtures({username: me, password: password}, 'fixtures')
      fixtures.fixtures_db.view = (db, view, opts, cb) => {cb(null, {rows: [{key: [0, 1], value: [0,1,2,3]}]})}
      fixtures.gameweek_matches(1).then(e => {
        assert.deepEqual(e, [{dt: 1, home: 0, away: 1, goals:[2,3]}])
        done()
      }).catch(console.log)
    })
  })
  describe('#gameweeks_dates()', function (done) {
    it('should resolve no gameweeks', function (done) {
      const fixtures = new Fixtures({username: me, password: password}, 'fixtures')
      fixtures.gameweek_dates.set('test', 'test')
      fixtures.fixtures_db = null
      fixtures.gameweeks_dates().then(e => done())
    })
    it('should resolve db errors to failures', function (done) {
      const fixtures = new Fixtures({username: me, password: password}, 'fixtures')
      fixtures.fixtures_db.view = (db, view, opts, cb) => cb(true) 
      fixtures.gameweeks_dates().catch(e => done())
    })
    it('should resolve db results', function (done) {
      const fixtures = new Fixtures({username: me, password: password}, 'fixtures')
      fixtures.fixtures_db.view = (db, view, opts, cb) => cb(false, {rows: [{value: 'value', key: 0}, {value: 'value', key: 1}, {value: 'next', key: 2}]}) 
      fixtures.gameweeks_dates().then(e => {
        assert.deepEqual(e.get('value'), [0, 1])
        assert.deepEqual(e.get('next'), [2])
        done()
      })
    })
  })
  describe('#matchday_times()', function () {
    it('should resolve db results', function (done) {
      const fixtures = new Fixtures({username: me, password: password}, 'fixtures')
      fixtures.fixtures_db.view = (db, view, opts, cb) => cb(false, {rows: [{key: '2015-08-08T11:45:00Z', doc: {matchDay: 10}}, {key: '2015-08-08T11:45:00Z'}, {key: '2015-08-08T14:00:00Z'}, {value: 'next', key: '2015-08-08T15:00:00Z'}]}) 
      fixtures.matchday_times('2018-08-08').then(e => {
        assert.deepEqual(e, {gameweek: 10, times: ['11:45:00', '14:00:00', '15:00:00']})
        done()
      })
    })
    it('should cache results', function (done) {
      const fixtures = new Fixtures({username: me, password: password}, 'fixtures')
      fixtures.fixtures_db.view = (db, view, opts, cb) => cb(false, {rows: [{key: '2015-08-08T11:45:00Z', doc: {matchDay: 10}}, {key: '2015-08-08T11:45:00Z'}, {key: '2015-08-08T14:00:00Z'}, {value: 'next', key: '2015-08-08T15:00:00Z'}]}) 
      fixtures.matchday_times('2018-08-08').then(e => {
        fixtures.fixtures_db = null
        fixtures.matchday_times('2018-08-08').then(e => {
          assert.deepEqual(e, {gameweek: 10, times: ['11:45:00', '14:00:00', '15:00:00']})
          done()
        })
      })
    })
 
  })
})
