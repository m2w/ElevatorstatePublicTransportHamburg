"use strict"

const express = require('express');
const serverInstance = express();
const geofox = require('./geofox');

const FCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send',
  Devices = require('./devicesdb'),
  Fetcher = require('./statefetcher'),
  Notification = require('./notification'),
  dotenv = require('dotenv'),
  StationRepository = require('./repositories/stationRepository');

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
});

// a device has subscribed to service and sends token:
serverInstance.get('/subscribe', function (req, res) {
  mDevices.subscribe(req.query.token);
  res.send('Device successful subscribed');
});

// a device has unsubscribed to service and sends token:
serverInstance.get('/unsubscribe', function (req, res) {
  mDevices.unsubscribe(req.query.token);
  res.send('Device successful unsubscribed');
});

serverInstance.get('/stations', (req, res) => {
  res.json(StationRepository.all(mFetcher));
});

serverInstance.get('/stations/:stationId', (req, res) => {
  // `stationId` is a geofox id, e.g. `Master:91900`
  geofox.getStationData(req.params.stationId).then((data) => {
    res.json(data);
  });
});

serverInstance.get('/stations/closest/:lat/:long', (req, res) => {
  // `lat` and `long` are coordinates, e.g. 10.13121
  let lat = req.params.lat;
  let long = req.params.long;
  if (lat !== undefined && long !== undefined) {
    geofox.closestStation({ x: long, y: lat }).then((stations) => {
      res.json(stations);
    });
  } else {
    res.json({
      error: 'invalid params',
      msg: 'missing either lat or long params'
    });
  }
});

serverInstance.get('/route/:from/:dest', (req, res) => {
  // `from` and `to` are geofox ids, e.g. Master:91900
  let from = StationRepository.get(mFetcher, req.params.from);
  let to = StationRepository.get(mFetcher, req.params.dest);
  if (from !== undefined && to !== undefined) {
    geofox.getRoutes(from.coordinate, to.coordinate).then((route) => {
      res.json(route);
    });
  } else {
    res.json({
      error: 'invalid params',
      msg: 'either from or dest has no elevators or is an invalid route target'
    });
  }
});



// start server
serverInstance.listen(serverInstance.get('port'), function () {
  console.log('Server started at port ' + process.env.PORT);
});

mFetcher.on('data', (payload) => {
  new Notification(payload);
});


