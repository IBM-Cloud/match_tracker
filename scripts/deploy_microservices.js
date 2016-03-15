'use strict'
const spawn = require('child_process').spawn
const fs = require('fs')
const path = require('path')

const DeployCommand = (dir, command) => {
  return new Promise((resolve, reject) => {
    const cf = spawn('cf', [command], {
      cwd: dir
    })
    let error = false

    cf.stderr.on('data', (data) => {
      error = true
      console.log(`stderr for microservice ${dir.split('/').pop()}: ${data}`)
    })

    cf.on('exit', () => {
      error ? reject() : resolve()
    })
  })
}

const DeployMicroservices = () => {
  return new Promise((resolve, reject) => {
    const dir = 'microservices'
    fs.readdir(dir, (err, files) => {
      if (err) return reject(err)
      const microservices = files
        .filter(file => file[0] !== '.')
        .map(name => path.join(process.cwd(), dir, name))
        .map(path => DeployCommand(path, 'push'))
      Promise.all(microservices).then(resolve).catch(reject)
    })
  })
}

module.exports = DeployMicroservices
