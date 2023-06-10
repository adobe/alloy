import { number, objectOf, string } from "../../utils/validation";
import { createMediaAnalyticsTracker } from "./createMediaAnalyticsTracker";

const createMediaAnalytics = ({
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

createMediaAnalytics.namespace = "Media Analytics";

createMediaAnalytics.configValidators = {
  mediaAnalytics: objectOf({
    channel: string().nonEmpty(),
    playerName: string().nonEmpty(),
    version: string().nonEmpty(),
    heartbeatFrequency: number()
      .minimum(10)
      .default(10)
  })
};

export default createMediaAnalytics;
