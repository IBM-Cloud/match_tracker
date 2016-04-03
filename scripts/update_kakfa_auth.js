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
const replace = require('replace-in-file')

const ReplaceJaasConf = (regex, replacement) => {
  return new Promise((resolve, reject) => {
    replace({
      files: [
        './microservices/fixtures_monitor/src/main/resources/jaas.conf',
        './microservices/match_tweet_processor/src/main/resources/jaas.conf',
        './microservices/match_twitter_search/src/main/resources/jaas.conf'
      ],
      replace: regex,
      with: replacement
    }, function (error, changedFiles) {
      if (error) {
        reject(error)
        return console.error('Error occurred:', error)
      }

      resolve()
    })
  })
}

const UpdateKafkaAuth = (user, pass) => {
  return ReplaceJaasConf(/username=".*"/g, `username="${user}"`).then(() => {
    return ReplaceJaasConf(/password=".*"/g, `password="${pass}"`)
  })
}

module.exports = UpdateKafkaAuth
