import { number, objectOf, string } from "../../utils/validation";
import { createMediaAnalyticsTracker } from "./createMediaAnalyticsTracker";

const createLegacyMediaAnalytics = ({
  config,
  logger,
  sendEdgeNetworkRequest,
  eventManager
}) => {
  return {
    lifecycle: {
      onResponse({ response }) {
        const sessionId = response.getPayloadsByType(
          "media-analytics:new-session"
        );
        logger.info("MA session ID", sessionId);

        if (sessionId.length > 0) {
          return { sessionId: sessionId[0].sessionId };
        }

        return {};
      }
    },
    commands: {
      getMediaAnalyticsTracker: {
        run: () => {
          const tracker = createMediaAnalyticsTracker({
            config,
            logger,
            sendEdgeNetworkRequest,
            eventManager
          });

          return tracker;
        }
      }
    }
  };
};

createLegacyMediaAnalytics.namespace = "Legacy Media Analytics";

export default createLegacyMediaAnalytics;
