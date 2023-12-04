import MediaEvents from "./MediaConstants/mediaEvents";

export default ({ playerCache }) => {
  return ({ playerId, xdm }) => {
    const { eventType } = xdm;
    if (
      eventType === MediaEvents.SESSION_COMPLETE ||
      eventType === MediaEvents.SESSION_END
    ) {
      playerCache.stopTicker({ playerId });
    }
  };
};
