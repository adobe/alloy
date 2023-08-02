import { toInteger } from "../../utils";

export default ({ eventManager, heartbeatTicker, playerCache }) => {
  return ({ options, event }) => {
    const { playerId, onBeforeMediaEvent } = options;
    const { playhead, qoeDataDetails } = onBeforeMediaEvent({ playerId });

    event.mergeXdm({
      mediaCollection: {
        playhead: toInteger(playhead),
        qoeDataDetails
      }
    });

    const sessionIdPromise = eventManager.sendEvent(event).then(result => {
      if (!result.sessionId) {
        return Promise.reject(new Error("No session ID available."));
      }

      playerCache.startTicker({
        heartbeatTicker,
        playerId,
        sessionId: result.sessionId
      });

      return result.sessionId;
    });

    const player = {
      sessionId: sessionIdPromise,
      onBeforeMediaEvent
    };
    playerCache.put(playerId, player);

    return sessionIdPromise;
  };
};
