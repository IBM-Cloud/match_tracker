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
const spawn = require('child_process').spawn
const fs = require('fs')
const path = require('path')

const DeployCommand = (dir, command) => {
  return new Promise((resolve, reject) => {
    const cf = spawn('cf', [command], {
      cwd: dir
    })
    let error = false

    cf.stdout.on('data', (data) => {
      error = true
      console.log(`stdout for microservice ${dir.split('/').pop()}: ${data}`)
    })

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
