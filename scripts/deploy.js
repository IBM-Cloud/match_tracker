'use strict'
const program = require('commander')
const prompt = require('prompt')
const SetupDBs = require('./setup_dbs.js')
const UpdateKafkaAuth = require('./update_kakfa_auth.js')

const ready = (program) => {
  if (!program.skip_db) {
    initialise_db(program.cloudant_user, program.cloudant_pass)
  }

  if (!program.skip_kafka) {
    initialise_kafka(program.kafka_user, program.kafka_pass)
  }
}

const err_handler = (err) => {
  console.log('Failed! Sorry, we\'re going to leave it here...', err)
}

const initialise_kafka = (username, password) => {
  console.log('Updating Kafka Authentication Credentials...')
  UpdateKafkaAuth(username, password).then(() => {
    console.log('Finished Updating Kafka Authentication Credentials.')
  }).catch(err_handler)
}

const initialise_db = (cloudant_user, cloudant_pass) => {
  console.log('Starting Cloudant DB setup...')
  SetupDBs(cloudant_user, cloudant_pass).then(() => {
    console.log('Finished Cloudant DB setup')
  }).catch(err_handler)
}

program
  .option('--cloudant_user [user]', 'Define Cloudant Username')
  .option('--cloudant_pass [pass]', 'Define Cloudant Password')
  .option('--kafka_user [user]', 'Define Kafka Username')
  .option('--kafka_pass [pass]', 'Define Kafka Password')
  .option('--skip_db', 'Skip Database Initialisation')
  .option('--skip_kafka', 'Skip Kafka Auth Setup')
  .parse(process.argv)

let args = []

if (!program.skip_db) {
  args.push('cloudant_user', 'cloudant_pass')
}

if (!program.skip_kafka) {
  args.push('kafka_user', 'kafka_pass')
}

args = args.filter(arg => !program[arg])

if (args.length) {
  console.log('Please enter the following configuration values')
  prompt.message = ''
  prompt.start()

  prompt.get(args, function (err, result) {
    if (err) {
      console.log('Hmmm, failed to read configuration values from prompt, adios!')
      process.exit(1)
    }
    args.forEach(arg => program[arg] = result[arg])
    ready(program)
  })
} else {
  ready(program)
}
