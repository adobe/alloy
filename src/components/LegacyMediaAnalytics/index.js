import { createMediaAnalyticsTracker } from "./createMediaAnalyticsTracker";
import createGetMediaSession from "../MediaAnalytics/createGetMediaSession";
import createTrackMediaEvent from "../MediaAnalytics/createTrackMediaEvent";

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
          const tracker = createMediaAnalyticsTracker({
            config,
            logger,
            getMediaSession,
            trackMediaEvent
          });

          return tracker;
        }
      }
    }
  };
};

createLegacyMediaAnalytics.namespace = "Legacy Media Analytics";

export default createLegacyMediaAnalytics;
