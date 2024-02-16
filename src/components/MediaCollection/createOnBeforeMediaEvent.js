import isBlankString from "../../utils/isBlankString";
import MediaEvents from "./constants/eventTypes";

export default ({
  mediaSessionCacheManager,
  logger,
  config,
  trackMediaEvent
}) => {
  return ({ response, playerId, getPlayerDetails }) => {
    const mediaPayload = response.getPayloadsByType(
      "media-analytics:new-session"
    );
    logger.info("Media payload returned: ", mediaPayload);

    const { sessionId } = mediaPayload[0];
    if (isBlankString(sessionId)) {
      return {};
    }

    if (!playerId || !getPlayerDetails) {
      return { sessionId };
    }

    const heartbeatId = setTimeout(() => {
      trackMediaEvent({
        playerId,
        xdm: {
          eventType: MediaEvents.PING
        }
      });
    }, config.mediaCollection.mainPingInterval * 1000);

    mediaSessionCacheManager.saveHeartbeat({ playerId, heartbeatId });

    return { sessionId };
  };
};
