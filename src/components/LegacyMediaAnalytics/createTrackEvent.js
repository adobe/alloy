import createMediaRequestPayload from "./createMediaRequestPayload";
import createMediaRequest from "../MediaAnalytics/createMediaRequest";
import createMediaEvent from "./createMediaEvent";

const createEventType = type => {
  return `media.${type}`;
};

export default ({ deferSession, sendEdgeNetworkRequest, trackerState }) => {
  return ({ type, mediaDetails }) => {
    const playhead = 0;
    const mediaRequestPayload = createMediaRequestPayload();
    const request = createMediaRequest({ mediaRequestPayload, action: type });

    const eventType = createEventType(type);
    return deferSession.promise.then(sessionID => {
      const mediaCollection = {
        playhead,
        sessionID,
        ...mediaDetails
      };
      const event = createMediaEvent({
        eventType,
        mediaCollection
      });

      mediaRequestPayload.addEvent(event);
      trackerState.latestTriggeredEvent = Date.now();
      return sendEdgeNetworkRequest({ request });
    });
  };
};
