const axios = require('axios');

const blackListApi = axios.create({
  baseURL: "https://apibl.spamhaus.net/lookup/v1",
  headers: {
    'Authorization': 'Bearer '+process.env.SPAMHAUS_APIKEY,
    'Accept': 'application/json'
  }
});
module.exports = {
    blackListApi
}