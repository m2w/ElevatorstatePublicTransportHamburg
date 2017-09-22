const axios = require('axios');
const crypto = require('crypto');
const dotenv = require('dotenv');

// Load .env-files
dotenv.load();

let genSig = (body) => {
  let hmac = crypto.createHmac('sha1', process.env.GEOFOX_PSWD);
  let s = JSON.stringify(body);
  hmac.update(s);
  return hmac.digest('base64');
}

exports.getStationData = (id) => {
  let body = {
    station: {
      id: id
    }
  };
  let client = axios.create({
    baseURL: 'http://api-hack.geofox.de/',
    timeout: 1000,
    headers: {
      'geofox-auth-type': 'HmacSHA1',
      'geofox-auth-user': 'mobi-hack',
      'geofox-auth-signature': genSig(body)
    }
  });
  return client.post('/gti/public/getStationInformation',
    body
  ).then((resp) => {
    return resp.data.partialStations;
  }).catch((err) => {
    console.log(err);
  });
}

exports.getAllStations = () => {
  let body = {
    "language": "de",
    "version": 31.1
  }
  let client = axios.create({
    baseURL: 'http://api-hack.geofox.de/',
    timeout: 5000,
    headers: {
      'geofox-auth-type': 'HmacSHA1',
      'geofox-auth-user': 'mobi-hack',
      'geofox-auth-signature': genSig(body)
    }
  });
  return client.post('/gti/public/listStations',
    body
  ).then((resp) => {
    return resp.data.stations;
  }).catch((err) => {
    console.log(err);
  });
}
