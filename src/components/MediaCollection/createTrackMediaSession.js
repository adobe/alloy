export default ({
  config,
  logger,
  mediaEventManager,
  mediaSessionCacheManager,
  legacy = false
}) => {
  return options => {
    if (!config.mediaCollection) {
      logger.warn("Media Collection is not configured.");

      return Promise.resolve();
    }

    const { playerId, getPlayerDetails } = options;
    const event = mediaEventManager.createMediaSession(options);

    mediaEventManager.augmentMediaEvent({
      event,
      playerId,
      getPlayerDetails
    });

    const sessionPromise = mediaEventManager.trackMediaSession({
      event,
      mediaOptions: {
        playerId,
        getPlayerDetails,
        legacy
      }
    });

    mediaSessionCacheManager.storeSession({
      playerId,
      sessionDetails: {
        sessionPromise,
        getPlayerDetails
      }
    });

    return sessionPromise;
  };
};
