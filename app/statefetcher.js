"use strict"

const fetch = require('node-fetch');
const Axios = require('axios');
const geofox = require('./geofox');


const EventEmitter = require('events');
const GEOFOX_URL = 'https://geofox.hvv.de/data-service/rest/elevators/stations/';
// private var
let lastState = {};
let cache = {};

class Fetcher extends EventEmitter {
  constructor() {
    super();
    this.count = 1;
    this.lastState = {}
    this.cron;
  };
  start() {
    console.log('=== Initializing Elevator Status Monitor');
    geofox.getAllStations().then((data) => {
      console.log('=== Retrieved Station Data');
      cache.stations = data;
    });

    this._fetchStateAndGetDiff();
    this.cron = setInterval(
      () => this._fetchStateAndGetDiff(),
      30 * 60 * 1000
    );
  };

  stop() {
    clearInterval(this.cron);
  };

  _fetchStateAndGetDiff(json) {
    const start = new Date().getTime();
    Axios(GEOFOX_URL).then(response => {
      if (response && response.status === 200) {
        try {
          const json = response.data;
          var newState = {};
          cache = json;
          // extracting hash of all states
          json.stations.forEach(station => {
            Object.getOwnPropertyNames(station.elevators).forEach(elevatorId => {
              newState[station.gfxId + "_" + elevatorId] = station.elevators[elevatorId].state;
            });
          });
          let diffs = [];
          // make diff
          Object.getOwnPropertyNames(newState).forEach(elevatorId => {
            if (newState[elevatorId] != lastState[elevatorId]) {
              let obj = {};
              obj[elevatorId] = newState[elevatorId]
              diffs.push(obj);
            }
          });
          this.emit('data', diffs);
          // save new elevator state to state
          Object.assign(this.lastState, newState);
        }
        catch (E) {
          console.log(E);
        }
      } else {
        //console.log("Got an error: ", error, ", status code: ", response.statusCode)
      }
    })
  }
};
module.exports = Fetcher;