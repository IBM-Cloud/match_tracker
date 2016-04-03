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
const Cloudant = require('cloudant')

const DBViews = {
  fixtures: {
    _id: '_design/matches',
    views: {
      all: {
        map: 'function (doc) {\n  emit(doc._id, 1);\n}'
      },
      match_dates: {
        map: 'function (doc) {\n   if (doc.status !== "POSTPONED") { emit(doc.date, [doc.homeTeam, doc.awayTeam]);}\n}'
      },
      gameweek_days: {
        reduce: 'function (keys, values, rereduce) {\n  return values[0];\n}',
        map: 'function (doc) {\n  var date = doc.date.split(\'T\')[0];\n  emit(date, doc.matchDay);\n}'
      },
      gameweek_matchdays: {
        map: 'function (doc) {\n    if (doc.status !== "POSTPONED") {emit([doc.matchDay, doc.date], [doc.homeTeam, doc.awayTeam, doc.homeTeamGoals, doc.awayTeamGoals]);}\n}'
      }
    }
  },
  match_tweets: {
    _id: '_design/matches',
    views: {
      performance: {
        map: "function (doc) {\n  var team_hashtags = {\n  \"mufc\": 0,\n  \"coys\": 1,\n  \"afcb\": 2,\n  \"avfc\": 3,\n  \"efc\": 4,\n  \"watfordfc\": 5,\n  \"lcfc\": 6,\n  \"safc\": 7,\n  \"ncfc\": 8,\n  \"cpfc\": 9,\n  \"cfc\": 10,\n  \"swans\": 11,\n  \"nufc\": 12,\n  \"saintsfc\": 13,\n  \"arsenal\": 14,\n  \"whufc\": 15,\n  \"scfc\": 16,\n  \"lfc\": 17,\n  \"wba\": 18,\n  \"mcfc\": 19\n};\n\nvar three_letter_teams = {\n  \"mun\": 0, \n  \"tot\": 1,\n  \"bou\": 2,\n  \"avl\": 3,\n  \"eve\": 4,\n  \"wat\": 5,\n  \"lei\": 6,\n  \"sun\": 7,\n  \"nor\": 8,\n  \"cry\": 9,\n  \"che\": 10,\n  \"swa\": 11,\n  \"new\": 12,\n  \"sou\": 13,\n  \"ars\": 14,\n  \"whu\": 15,\n  \"stk\": 16,\n  \"liv\": 17,\n  \"wba\": 18,\n  \"mci\": 19\n};\n\n  var mentioned_teams = [];\n  var sentiment = 0;\n  if (doc.sentiment === \"POSITIVE\") {\n    sentiment = 1;\n  } else if (doc.sentiment === \"NEGATIVE\") {\n    sentiment = -1;\n  }\n  var postedTime = doc.postedTime.split('.')[0] + 'Z';\n  \n  doc.hashtags.forEach(function (ht) {\n    if (team_hashtags.hasOwnProperty(ht)) {\n      mentioned_teams.push(team_hashtags[ht]);\n    } else if (ht.length === 6){\n      var home = ht.slice(0, 3), away = ht.slice(3, 6);\n      if (three_letter_teams.hasOwnProperty(home) && three_letter_teams.hasOwnProperty(away)) {\n        mentioned_teams.push(three_letter_teams[home]);\n        mentioned_teams.push(three_letter_teams[away]);\n      }\n    }\n  });\n  \n  if (mentioned_teams.length) {\n    emit(postedTime, [mentioned_teams, sentiment]);\n  }\n}"
      }
    }
  }
}

const CreateDB = (db, user, password) => {
  return new Promise((resolve, reject) => {
    const cloudant = Cloudant({account: user, password: password})
    cloudant.db.create(db, (err, body) => {
      if (err && err.statusCode !== 412) {
        console.log(err)
        reject(err)
        return
      }
      resolve(cloudant.use(db))
    })
  })
}

const SetupViews = (name, db) => {
  return new Promise((resolve, reject) => {
    db.insert(DBViews[name], (err, body) => {
      if (err && err.statusCode !== 409) {
        console.log(err)
        reject()
        return
      }
      resolve()
    })
  })
}

const SetupDBs = (user, password) => {
  return Promise.all(Object.keys(DBViews).map(db => CreateDB(db, user, password).then(session => SetupViews(db, session))))
}

module.exports = SetupDBs
