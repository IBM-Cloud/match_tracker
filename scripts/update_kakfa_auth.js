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
