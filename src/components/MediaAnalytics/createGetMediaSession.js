import { deepAssign, toInteger } from "../../utils";

export default ({
  config,
  eventManager,
  playerCache,
  heartbeatTicker,
  logger
}) => {
  return options => {
    if (!config.mediaAnalytics) {
      logger.info("Media Analytics was not configured.");

      return Promise.reject(new Error("Media Analytics was not configured."));
    }

    const { playerId, onBeforeMediaEvent } = options;
    const { playerName, channel, version } = config.mediaAnalytics;

    const xdm = {};
    deepAssign(xdm, options.xdm);

    const { mediaCollection } = xdm;

    mediaCollection.sessionDetails.playerName =
      mediaCollection.sessionDetails.playerName || playerName;
    mediaCollection.sessionDetails.channel =
      mediaCollection.sessionDetails.channel || channel;
    mediaCollection.sessionDetails.appVersion =
      mediaCollection.sessionDetails.appVersion || version;

    if (playerId && onBeforeMediaEvent) {
      const { playhead, qoeDataDetails } = onBeforeMediaEvent({ playerId });
      mediaCollection.playhead = toInteger(playhead);
      mediaCollection.qoeDataDetails = qoeDataDetails;
    }

    const event = eventManager.createEvent();
    event.mergeXdm(xdm);

    const sessionIdPromise = eventManager.sendEvent(event).then(result => {
      const { sessionId } = result;
      if (!sessionId) {
        return Promise.reject(new Error("No session ID available."));
      }
      return sessionId;
    });

    if (playerId) {
      const player = {
        sessionId: sessionIdPromise,
        onBeforeMediaEvent
      };
      playerCache.put(playerId, player);
    }
    return sessionIdPromise.then(sessionId => {
      if (playerId) {
        playerCache.startTicker(heartbeatTicker, playerId, sessionId);
      }
      return sessionId;
    });
  };
};
