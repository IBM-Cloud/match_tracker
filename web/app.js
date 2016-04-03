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
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const compression = require('compression')
const cfenv = require('cfenv')
const winston = require('winston')
const routes = require('./server/routes.js')

const appEnv = cfenv.getAppEnv()
const db_creds = cfenv.getAppEnv().getServiceCreds(/cloudant/i)

if (!db_creds) {
  winston.error('Missing cloudant service for match tracker. Have you configured and bound them to your application? Exiting...')
  process.exit(1)
}

const creds = {username: db_creds.username, password: db_creds.password}

app.use(express.static('public'))
app.use(compression())
routes(app, io, creds)

http.listen(appEnv.port, () => {
  winston.info(`Match Tracker app listening on port ${appEnv.port}.`)
})
