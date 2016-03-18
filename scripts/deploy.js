'use strict'
const program = require('commander')
const prompt = require('prompt')
const SetupDBs = require('./setup_dbs.js')
const UpdateKafkaAuth = require('./update_kakfa_auth.js')
const BuildMicroservices = require('./build_microservices.js')
const DeployMicroservices = require('./deploy_microservices.js')
const DeployWebApp = require('./deploy_web_app.js')

const ready = (program) => {
  let command = Promise.resolve()

  if (!program.skip_db) {
    command = initialise_db(program.cloudant_user, program.cloudant_pass)
  }

  if (!program.skip_kafka) {
    command = command.then(() => initialise_kafka(program.kafka_user, program.kafka_pass))
  }

  if (!program.skip_build) {
    command = command.then(() => build_microservices())
  }

  if (!program.skip_deploy_ms) {
    command = command.then(() => deploy_microservices())
  }

  if (!program.skip_deploy_web) {
    command.then(() => deploy_web_app())
  }
}

const err_handler = (err) => {
  console.log('Failed! Sorry, we\'re going to leave it here...', err)
}

const initialise_kafka = (username, password) => {
  console.log('Updating Kafka Authentication Credentials...')
  return UpdateKafkaAuth(username, password).then(() => {
    console.log('Finished Updating Kafka Authentication Credentials.')
  }).catch(err_handler)
}

const initialise_db = (cloudant_user, cloudant_pass) => {
  console.log('Starting Cloudant DB setup...')
  return SetupDBs(cloudant_user, cloudant_pass).then(() => {
    console.log('Finished Cloudant DB setup')
  }).catch(err_handler)
}

const build_microservices = () => {
  console.log('Building microservices...')
  return BuildMicroservices().then(() => {
    console.log('Finished building microservices')
  }).catch(err_handler)
}

const deploy_microservices = () => {
  console.log('Deploying microservices... (this may take a while! use cf logs to follow progress.')
  return DeployMicroservices().then(() => {
      console.log('Finished deploying microservices')
  }).catch(err_handler)
}

const deploy_web_app = () => {
  console.log('Deploying web app... (nearly finished!)')
  return DeployWebApp().then(() => {
      console.log('Finished deploying web app')
  }).catch(err_handler)
}
program
  .option('--cloudant_user [user]', 'Define Cloudant Username')
  .option('--cloudant_pass [pass]', 'Define Cloudant Password')
  .option('--kafka_user [user]', 'Define Kafka Username')
  .option('--kafka_pass [pass]', 'Define Kafka Password')
  .option('--skip_db', 'Skip Database Initialisation')
  .option('--skip_kafka', 'Skip Kafka Auth Setup')
  .option('--skip_build', 'Skip Building Microservices')
  .option('--skip_deploy_ms', 'Skip Deploying Microservices')
  .option('--skip_deploy_web', 'Skip Deploying Web App')
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
