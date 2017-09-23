const axios = require('axios');
const crypto = require('crypto');

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

exports.getRoutes = (coordianteS, coordianteD) => {
  let body = {
    "version": 31.1,
    "starts": [
      {
        "coordinate": coordianteS
      }
    ],
    "dests": [
      {
        "coordinate": coordianteD
      }
    ],
    "type": "EPSG_4326",
    "serviceType": "FOOTPATH"
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
  return client.post('/gti/public/getIndividualRoute',
    body
  ).then((resp) => {
    // length in meter
    // time in minutes
    return resp.data.routes;
  }).catch((err) => {
    console.log(err);
  });
}

// getRoutes({ x: 9.952789, y: 53.571653 }, { x: 9.90158, y: 53.610399 });
