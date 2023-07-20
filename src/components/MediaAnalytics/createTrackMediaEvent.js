import createMediaRequestPayload from "../LegacyMediaAnalytics/createMediaRequestPayload";
import createMediaRequest from "./createMediaRequest";
import injectTimestamp from "../Context/injectTimestamp";
import { deepAssign } from "../../utils";
import toInteger from "../../utils/toInteger";
import MediaEvents from "./MediaConstants/MediaEvents";

const getActionFromEventType = eventType => {
  return eventType.split(".")[1];
};

export default ({ sendEdgeNetworkRequest, playerCache, config, logger }) => {
  return options => {
    if (!config.mediaAnalytics) {
      logger.info("Media Analytics was not configured.");
      return Promise.reject(new Error("Media Analytics was not configured."));
    }
    const { xdm, playerId } = options;
    const mediaRequestPayload = createMediaRequestPayload();
    const action = getActionFromEventType(xdm.eventType);
    const request = createMediaRequest({
      mediaRequestPayload,
      action
    });

    if (playerId) {
      const player = playerCache.get(playerId);
      const { sessionId: sessionIdPromise, onBeforeMediaEvent } = player;

      if (xdm.eventType === MediaEvents.SESSION_COMPLETE) {
        clearInterval(player.ticker);
      }
      return sessionIdPromise.then(sessionID => {
        const event = {
          xdm: options.xdm
        };

        if (onBeforeMediaEvent) {
          const { playhead, qoeDetails } = onBeforeMediaEvent({ playerId });

          deepAssign(event.xdm.mediaCollection, {
            playhead: toInteger(playhead)
          });
          deepAssign(event.xdm.mediaCollection, { qoeDetails });
        }

        deepAssign(event.xdm.mediaCollection, { sessionID });

        const timestamp = injectTimestamp(() => new Date());

        timestamp(event.xdm);

        mediaRequestPayload.addEvent(event);
        const currentTime = Date.now();
        return sendEdgeNetworkRequest({ request }).then(() => {
          player.latestTriggeredEvent = currentTime;
          return {};
        });
      });
    }
  };
};
