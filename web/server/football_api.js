'use strict'
let request = require('request')

const jar = request.jar()

request = request.defaults({jar: jar})

const login_url = 'http://matchtracker:matchtracker@football-api.com/letmein'

const username = 'matchtracker'
const password = 'matchtracker'

request.post(login_url, {form: {log: username, pwd: password}}, (err, response) => {
  if (err) {
    console.error('Errored', err)
    return
  }
  console.log('Success', response.statusCode)
  if (response.statusCode === 302) {
    console.log('worked')
    const form = {action: 'ipForm_save_ips', ip1: '1.2.3.5' }
    request.post('http://football-api.com/wp-admin/admin-ajax.php', {form: form}, (err, response) => {
      if (err) {
        console.log('error', err)
      }
      console.log('response', response.statusCode)
    }) 
  }
})
