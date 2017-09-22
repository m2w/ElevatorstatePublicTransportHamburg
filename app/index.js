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


