export default ({ config, trackMediaEvent, playerCache }) => {
  return ({ playerId, sessionId }) => {
    console.log(config);
    const currentTime = Date.now();
    const player = playerCache.get(playerId);
    const { onBeforeMediaEvent } = player;
    const { mainPingInterval } = config.mediaAnalytics;
    console.log(currentTime - player.latestTriggeredEvent, mainPingInterval);
    if (
      Math.abs(currentTime - player.latestTriggeredEvent) / 1000 >
      mainPingInterval
    ) {
      console.log("pings", mainPingInterval);
      const { playhead } = onBeforeMediaEvent(playerId);

      const xdm = {
        eventType: "media.ping",
        mediaCollection: {
          playhead,
          sessionID: sessionId
        }
      };
      console.log("pings", xdm);

      return trackMediaEvent({ playerId, xdm });
    }
  };
};
