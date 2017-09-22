"use strict"

const express = require('express');
const serverInstance = express();
const geofox = require('./geofox');

const FCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send',
  Devices = require('./devicesdb'),
  Fetcher = require('./statefetcher'),
  Notification = require('./notification'),
  dotenv = require('dotenv');

// Load .env-files
dotenv.load();

serverInstance.use(express.static('views'));

let mFetcher = new Fetcher();
mFetcher.start();

let mDevices = new Devices();
serverInstance.set('port', (process.env.PORT));
// a device has subscribed to service and sends token:
serverInstance.get('/', function (req, res) {
  res.render('index');
})
// a device has subscribed to service and sends token:
serverInstance.get('/subscribe', function (req, res) {
  mDevices.subscribe(req.query.token);
  res.send('Device successful subscribed');
})
// a device has unsubscribed to service and sends token:
serverInstance.get('/unsubscribe', function (req, res) {
  mDevices.unsubscribe(req.query.token);
  res.send('Device successful unsubscribed');
})

let stationIdMatcher = /(\w+:\d+)_.*/i

serverInstance.get('/stations', (req, res) => {
  let cache = mFetcher.stationCache;
  let currentStatus = mFetcher.lastState;
  let stations = {};
  for (let elevator in currentStatus) {
    let res = stationIdMatcher.exec(elevator);
    let name = res[1];
    if (stations[name] === undefined) {
      stations[name] = {
        elevatorCount: 0,
        aggregateElevatorStatus: 0
      };
    }
    stations[name].elevatorCount += 1;
    stations[name].aggregateElevatorStatus += currentStatus[elevator];
  }

  let resp = [];
  for (let station of cache) {
    let statusData = stations[station.id];
    if (statusData !== undefined) {
      station.status = statusData;
      resp.push(station);
    }
  }
  res.json(resp);
});

serverInstance.get('/stations/:stationId', (req, res) => {
  geofox.getStationData(req.params.stationId).then((data) => {
    res.json(data);
  });
});

// start server
serverInstance.listen(serverInstance.get('port'), function () {
  console.log('Server started at port ' + process.env.PORT);
});

mFetcher.on('data', (payload) => {
  new Notification(payload);
});


