const axios = require('axios')


// axios.defaults.headers.common['x-apiToken'] =  process.env.REACT_APP_API_TOKEN

// export default axios.create({
//     baseURL: process.env.REACT_APP_BACKEND_SERVER
//   });
  
const backEnd = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_SERVER,
    headers: {
        'x-apiToken': process.env.REACT_APP_API_TOKEN
    }
});

module.exports = {
    backEnd
}