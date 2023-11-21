export default ({ config, eventManager, automaticSessionHandler, logger }) => {
  return options => {
    if (!config.mediaAnalytics) {
      logger.info("Media Analytics was not configured.");

      return Promise.reject(new Error("Media Analytics was not configured."));
    }
    const { playerName, channel, version } = config.mediaAnalytics;

    const event = eventManager.createEvent();
    event.mergeXdm(options.xdm);
    event.mergeXdm({
      eventType: "media.sessionStart",
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
