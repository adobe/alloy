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

    const sessionIdPromise = eventManager.sendEvent(event);
    playerCache.put(playerId, {
      sessionId: sessionIdPromise.then(result => {
        playerCache.startTicker({
          heartbeatTicker,
          playerId,
          sessionId: result.sessionId
        });

        return result.sessionId;
      }),
      onBeforeMediaEvent
    });

    return sessionIdPromise;
  };
};
