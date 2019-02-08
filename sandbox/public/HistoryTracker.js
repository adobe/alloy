function HistoryTracker(tracker, options) {

    console.log(tracker);
    console.log(options);

}

atag("registerPlugin", {
    params: {
        name: "historyTracker",
        plugin: HistoryTracker
    }
});
