"use strict"

const express = require('express');
const serverInstance = express();

const FCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send',
  Devices = require('./devicesdb'),
  Fetcher = require('./statefetcher'),
  Notification = require('./notification'),
  dotenv = require('dotenv');

// Load .env-files
dotenv.load();

let mDevices = new Devices();
serverInstance.set('port', (process.env.PORT));
// a device has subscribed to service and sends token:
serverInstance.get('/', function (req, res) {
  res.send('<pre>This is endpoint of MobilityHackathon2017 project of Hamburger Appwerft\nThis emdpoint receives the registrations for push notification and if the state of elevators is changed the the server sends messages to all devices.');
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

// start server
serverInstance.listen(serverInstance.get('port'), function () {
  console.log('Server started at port ' + process.env.PORT);
});

let mFetcher = new Fetcher();
mFetcher.start();

mFetcher.on('data', (payload) => {
  new Notification(payload);
});


