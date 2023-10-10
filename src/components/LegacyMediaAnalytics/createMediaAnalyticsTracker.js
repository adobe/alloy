import defer from "../../utils/defer";
import {
  AudioMetadataKeys,
  MediaObjectKey,
  VideoMetadataKeys,
  Event
} from "./Media/constants";
import createMediaHelper from "./Media/createMediaHelper";
import { deepAssign, isEmptyObject, isNumber } from "../../utils";

const createSessionDetails = contextData => {
  const sessionDetailsKnownKeys = Object.values({
    ...MediaObjectKey,
    ...VideoMetadataKeys,
    ...AudioMetadataKeys
  });
  const sessionDetails = {};
  const customMetadata = [];
  Object.keys(contextData).forEach(key => {
    if (sessionDetailsKnownKeys.includes(key)) {
      sessionDetails[key] = contextData[key];
    } else {
      customMetadata.push({
        name: key,
        value: contextData[key]
      });
    }
  });

  return { sessionDetails, customMetadata };
};
const createHeartbeat = ({ frequency, playerState, trackEvent }) => {
  // eslint-disable-next-line consistent-return
  return () => {
    const currentTime = Date.now();
    if (
      Math.abs(currentTime - playerState.latestTriggeredEvent) / 1000 >
      frequency
    ) {
      return trackEvent({ eventType: "ping" });
    }
  };
};
const createMediaDetailsObject = (info, context) => {
  Object.keys(info).forEach(infoKey => {});
};

const createGetInstance = ({
  config,
  logger,
  getMediaSession,
  trackMediaEvent
}) => {
  const { mediaAnalytics } = config;
  const frequency = mediaAnalytics.mainPingInterval;
  const trackerState = {
    qoe: null,
    lastPlayhead: 0,
    latestTriggeredEvent: null
  };
  let ticker;
  let deferSession = defer();

  const updateLastTimeEventTriggered = () => {
    trackerState.latestTriggeredEvent = Date.now();
  };

  const trackEvent = ({ eventType, mediaDetails }) => {
    return deferSession.promise
      .then(sessionID => {
        updateLastTimeEventTriggered();
        const xdm = {
          eventType: `media.${eventType}`,
          mediaCollection: {
            sessionID,
            playhead: trackerState.lastPlayhead
          }
        };
        if (mediaDetails) {
          deepAssign(xdm.mediaCollection, mediaDetails);
        }
        return trackMediaEvent({ xdm });
      })
      .catch(error => {
        logger.info(error);
      });
  };

  const heartbeatEngine = createHeartbeat({
    frequency,
    deferSession,
    playerState: trackerState,
    trackEvent
  });

  return {
    trackSessionStart: (mediaObject, contextData = {}) => {
      if (isEmptyObject(mediaObject)) {
        deferSession.reject("invalid media object");
        return {};
      }
      const mediaCollection = {
        playhead: 0
      };
      const { sessionDetails } = createSessionDetails(contextData);
      deepAssign(mediaCollection, mediaObject, { sessionDetails });

      return getMediaSession({
        xdm: {
          eventType: "media.sessionStart",
          mediaCollection
        }
      }).then(result => {
        updateLastTimeEventTriggered();
        deferSession.resolve(result.sessionId);

        ticker = setInterval(() => {
          heartbeatEngine();
        }, 1000);
      });
    },
    trackPlay: () => {
      return trackEvent({ eventType: Event.Play });
    },
    trackPause: () => {
      return trackEvent({ eventType: Event.Pause });
    },
    trackSessionEnd: () => {
      clearInterval(ticker);
      return trackEvent({ eventType: Event.SessionEnd });
    },
    trackComplete: () => {
      clearInterval(ticker);
      return trackEvent({ eventType: Event.SessionComplete });
    },
    trackError: errorId => {
      logger.info(`trackError(${errorId})`);

      const errorDetails = {
        name: errorId,
        source: "player"
      };
      const mediaDetails = {
        errorDetails
      };
      return trackEvent({ eventType: Event.SessionEnd, mediaDetails });
    },
    trackEvent: (eventType, info, context) => {
      const mediaDetails = createMediaDetailsObject(info, context);

      return deferSession.promise.then(sessionID => {
        return trackEvent({
          eventType: Event.SessionComplete,
          playhead: trackerState.lastPlayhead,
          sessionID,
          mediaDetails
        });
      });
    },
    updatePlayhead: time => {
      // no event should be triggered to the MA edge
      if (isNumber(time)) {
        trackerState.lastPlayhead = parseInt(time, 10);
      }
    },
    updateQoEObject: qoeObject => {
      if (!qoeObject) {
        return;
      }
      trackerState.qoe = qoeObject;
    },
    destroy: () => {
      logger.info("Destroy called, destroying the tracker");
      clearInterval(ticker);
      deferSession = null; // how to stop the tracker
    }
  };
};

export const createMediaAnalyticsTracker = ({
  config,
  logger,
  getMediaSession,
  trackMediaEvent
}) => {
  logger.info("Media Analytics Component was configured");

  return {
    getInstance: () => {
      return createGetInstance({
        config,
        logger,
        getMediaSession,
        trackMediaEvent
      });
    },
    createMediaHelper
  };
};
