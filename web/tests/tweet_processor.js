'use strict'

const assert = require('assert')
const TweetProcessor = require('../server/tweet_processor.js')

describe('Match Events', function() {
  describe('#_extract_sentiment', function () {
    it('should detect positive', function () {
      const tp = new TweetProcessor()
      const tweet = {sentiment: 'POSITIVE'}
      assert.equal(tp._extract_sentiment(tweet), 1)
    })
    it('should detect negative', function () {
      const tp = new TweetProcessor()
      const tweet = {sentiment: 'NEGATIVE'}
      assert.equal(tp._extract_sentiment(tweet), -1)
    })
    it('should detect neutral', function () {
      const tp = new TweetProcessor()
      const tweet = {sentiment: 'MISSING'}
      assert.equal(tp._extract_sentiment(tweet), 0)
    })
  })
  describe('#_extract_teams', function () {
    it('should detect team hashtags', function () {
      const tp = new TweetProcessor()
      const tweet = {hashtags: ['mufc', 'cfc', 'nufc']}
      assert.deepEqual(tp._extract_teams(tweet), [0, 10, 12])
    })
    it('should detect both team hashtags', function () {
      const tp = new TweetProcessor()
      const tweet = {hashtags: ['munavl', 'wateve']}
      assert.deepEqual(tp._extract_teams(tweet), [0, 3, 5 ,4])
    })
  })
  describe('#_extract_seconds', function () {
    it('should extract seconds at kickoff', function () {
      const tp = new TweetProcessor(["11:45:00", "15:00:00", "16:00:00"])
      const tweet = {postedTime: "2015-08-08T15:00:00Z"}
      assert.equal(tp._extract_seconds(tweet), 0)
    })
    it('should extract seconds during match', function () {
      const tp = new TweetProcessor(["11:45:00", "15:00:00", "16:00:00"])
      let tweet = {postedTime: "2015-08-08T15:01:00Z"}
      assert.equal(tp._extract_seconds(tweet), 60)
      tweet = {postedTime: "2015-08-08T17:00:00Z"}
      assert.equal(tp._extract_seconds(tweet), 60 * 60)
      tweet = {postedTime: "2015-08-08T12:00:00Z"}
      assert.equal(tp._extract_seconds(tweet), 15 * 60)
    })
  })
})
