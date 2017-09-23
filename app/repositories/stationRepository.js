let stationIdMatcher = /(\w+:\d+)_.*/i;

severity = (status) => {
    // 1 == ready, -1 == out-of-order, 0 == some issues
    if (status.every((s) => { return s === 1 })) {
        return 1;
    }
    if (status.every((s) => { return s <= 0 })) {
        return -1;
    }
    return 0;
};

exports.all = (mFetcher) => {
    let cache = mFetcher.stationCache;
    let currentStatus = mFetcher.lastState;
    let stations = {};
    for (let elevator in currentStatus) {
        let res = stationIdMatcher.exec(elevator);
        let name = res[1];
        if (stations[name] === undefined) {
            stations[name] = [];
        }
        stations[name].push(currentStatus[elevator]);
    }

    let resp = [];
    for (let station of cache) {
        let statusData = stations[station.id];
        if (statusData !== undefined) {
            station.status = severity(statusData);
            resp.push(station);
        }
    }

    return resp;
};

exports.get = (mFetcher, id) => {
    let cache = mFetcher.stationCache;
    for (let station of cache) {
        if (station.id === id) {
            return station;
        }
    }
    return undefined;
};
