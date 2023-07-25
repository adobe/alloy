export default ({ config, trackMediaEvent, playerCache }) => {
  return ({ playerId, sessionId }) => {
    const currentTime = Date.now();
    const player = playerCache.get(playerId);
    const { onBeforeMediaEvent } = player;
    const { mainPingInterval } = config.mediaAnalytics;

    if (
      Math.abs(currentTime - player.latestTriggeredEvent) / 1000 >
      mainPingInterval
    ) {
      const { playhead } = onBeforeMediaEvent(playerId);

      const xdm = {
        eventType: "media.ping",
        mediaCollection: {
          playhead,
          sessionID: sessionId
        }
      };

      return trackMediaEvent({ playerId, xdm });
    }

    return Promise.resolve();
  };
};
