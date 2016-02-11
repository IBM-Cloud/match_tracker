'use strict'
const express = require('express')
const compression = require('compression')
const cfenv = require("cfenv")
const winston = require('winston')
const routes = require('./server/routes.js')

const appEnv = cfenv.getAppEnv()
const db_creds = cfenv.getAppEnv().getServiceCreds(/cloudant/i)
const api_creds = cfenv.getAppEnv().getServiceCreds('football_api')

if (!db_creds) {
  winston.error('Missing cloudant service for match tracker. Have you configured and bound them to your application? Exiting...')
  process.exit(1)
}

if (!api_creds || !api_creds.key || !api_creds.username || !api_creds.password) {
  winston.error('Missing football api credentials for match tracker. Have you configured and bound them to your application? Exiting...')
  process.exit(1)
}

const creds = {username: db_creds.username, password: db_creds.password, api_key: api_creds.key, api_username: api_creds.username, api_password: api_creds.password}

const app = express()
app.use(express.static('public'))
app.use(compression())
routes(app, creds)

app.listen(appEnv.port, () => {
  winston.info(`Match Tracker app listening on port ${appEnv.port}.`)
})
