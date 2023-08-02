import MediaEvents from "./MediaConstants/MediaEvents";

export default ({ playerCache, config }) => {
  return ({ playerId, xdm }) => {
    const { eventType } = xdm;
    // when an ad starts we change the ping interval
    if (eventType === MediaEvents.AD_START) {
    }
    // when main content starts we change the ping interval
    if (eventType === MediaEvents.AD_START) {
    }
    // when session ends we remove the interval
    if (eventType === MediaEvents.AD_START) {
    }

    if (
      xdm.eventType === MediaEvents.SESSION_COMPLETE ||
      xdm.eventType === MediaEvents.SESSION_END
    ) {
      playerCache.stopTicker({ playerId });
    }
  };
};
