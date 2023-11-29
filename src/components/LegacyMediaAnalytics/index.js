import { createMediaAnalyticsTracker } from "./createMediaAnalyticsTracker";
import createGetMediaSession from "../MediaCollection/createGetMediaSession";
import createTrackMediaEvent from "../MediaCollection/createTrackMediaEvent";

const createLegacyMediaAnalytics = ({
  eventManager,
  sendEdgeNetworkRequest,
  config,
  logger
}) => {
  const trackMediaEvent = createTrackMediaEvent({
    sendEdgeNetworkRequest,
    config,
    logger
  });

  const getMediaSession = createGetMediaSession({
    config,
    logger,
    eventManager
  });

  return {
    commands: {
      getMediaAnalyticsTracker: {
        run: () => {
          return createMediaAnalyticsTracker({
            config,
            logger,
            getMediaSession,
            trackMediaEvent
          });
        }
      }
    }
  };
};

createLegacyMediaAnalytics.namespace = "Legacy Media Analytics";

export default createLegacyMediaAnalytics;
