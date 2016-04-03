/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
