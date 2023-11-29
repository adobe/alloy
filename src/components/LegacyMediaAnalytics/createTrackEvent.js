import createMediaRequestPayload from "./createMediaRequestPayload";
import createMediaRequest from "../MediaCollection/createMediaRequest";
import injectTimestamp from "../Context/injectTimestamp";

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
      const xdm = {
        eventType,
        mediaCollection: {
          playhead,
          sessionID,
          ...mediaDetails
        }
      };
      const timestamp = injectTimestamp(() => new Date());
      timestamp(xdm);

      mediaRequestPayload.addEvent({ xdm });
      trackerState.latestTriggeredEvent = Date.now();
      return sendEdgeNetworkRequest({ request });
    });
  };
};
