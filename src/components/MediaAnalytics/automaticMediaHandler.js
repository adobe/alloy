import MediaEvents from "./MediaConstants/MediaEvents";
import { deepAssign } from "../../utils";
import toInteger from "../../utils/toInteger";
import injectTimestamp from "../Context/injectTimestamp";

export default ({ playerCache, sendEdgeNetworkRequest }) => {
  return ({ xdm, playerId, mediaRequestPayload, request }) => {
    const player = playerCache.get(playerId);
    const { sessionId: sessionIdPromise, onBeforeMediaEvent } = player;

    if (xdm.eventType === MediaEvents.SESSION_COMPLETE) {
      clearInterval(player.ticker);
    }
    return sessionIdPromise.then(sessionID => {
      const event = { xdm };

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
  };
};
