
const axios = require('axios')

const slackHook = axios.create({
    baseURL: 'https://hooks.slack.com/services'
  });

  module.exports = {
      slackHook
  }