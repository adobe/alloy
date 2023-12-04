import MediaEvents from "./MediaConstants/MediaEvents";

export default ({ config, eventManager, automaticSessionHandler, logger }) => {
  return options => {
    if (!config.mediaCollection) {
      logger.info("Media Collection was not configured.");

      return Promise.reject(new Error("Media Collection was not configured."));
    }
    const { playerName, channel, version } = config.mediaCollection;

    const event = eventManager.createEvent();
    event.mergeXdm(options.xdm);
    event.mergeXdm({
      eventType: MediaEvents.SESSION_START,
      mediaCollection: {
        sessionDetails: {
          playerName:
            options.xdm.mediaCollection.sessionDetails.playerName || playerName,
          channel:
            options.xdm.mediaCollection.sessionDetails.channel || channel,
          appVersion:
            options.xdm.mediaCollection.sessionDetails.appVersion || version
        }
      }
    });

    if (options.playerId && automaticSessionHandler) {
      return automaticSessionHandler({ options, event });
    }

    return eventManager.sendEvent(event);
  };
};
