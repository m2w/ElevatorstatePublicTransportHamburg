let stationIdMatcher = /(\w+:\d+)_.*/i;

exports.all = (mFetcher) => {
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

    return resp;
};
