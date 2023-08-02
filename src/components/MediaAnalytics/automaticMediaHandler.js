import { deepAssign } from "../../utils";
import toInteger from "../../utils/toInteger";
import injectTimestamp from "../Context/injectTimestamp";

export default ({
  playerCache,
  sendEdgeNetworkRequest,
  postProcessMediaEvent
}) => {
  return ({ xdm, playerId, mediaRequestPayload, request }) => {
    const player = playerCache.get(playerId);
    if (!player) {
      return Promise.reject(new Error("No Player was found."));
    }

    const { sessionId: sessionIdPromise, onBeforeMediaEvent } = player;

    return sessionIdPromise.then(sessionID => {
      const event = {};
      deepAssign(event, { xdm });

      if (onBeforeMediaEvent) {
        const { playhead, qoeDetails } = onBeforeMediaEvent({ playerId });

        deepAssign(event.xdm, {
          mediaCollection: {
            playhead: toInteger(playhead),
            qoeDetails
          }
        });
      }

      deepAssign(event.xdm, { mediaCollection: { sessionID } });

      const timestamp = injectTimestamp(() => new Date());

      timestamp(event.xdm);

      mediaRequestPayload.addEvent(event);
      postProcessMediaEvent({ playerId, xdm });
      return sendEdgeNetworkRequest({ request }).then(() => {
        playerCache.updateLastTriggeredEventTS({ playerId });
        return {};
      });
    });
  };
};
