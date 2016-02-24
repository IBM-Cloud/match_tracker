'use strict'
const spawn = require('child_process').spawn
const fs = require('fs')
const path = require('path')

const BuildCommand = (dir, command) => {
  return new Promise((resolve, reject) => {
    const maven = spawn('mvn', [command], {
      cwd: dir
    })
    let error = false

    maven.stderr.on('data', (data) => {
      error = true
      console.log(`stderr for microservice ${dir.split('/').pop()}: ${data}`)
    })

    maven.on('exit', () => {
      error ? reject() : resolve()
    })
  })
}

const BuildMicroservices = () => {
  return new Promise((resolve, reject) => {
    const dir = 'microservices'
    fs.readdir(dir, (err, files) => {
      if (err) return reject(err)
      const microservices = files
        .filter(file => file[0] !== '.')
        .map(name => path.join(process.cwd(), dir, name))
        .map(path => BuildCommand(path, 'clean').then(() => BuildCommand(path, 'assembly:assembly')))
      Promise.all(microservices).then(resolve).catch(reject)
    })
  })
}

module.exports = BuildMicroservices
