import defer from "../../utils/defer";
import {
  AudioMetadataKeys,
  MediaObjectKey,
  VideoMetadataKeys,
  Event
} from "./Media/constants";
import createMediaHelper from "./Media/createMediaHelper";

const createSessionDetails = (mediaObject, contextData, config) => {
  const sessionDetailsKnownKeys = Object.values({
    ...MediaObjectKey,
    ...VideoMetadataKeys,
    ...AudioMetadataKeys
  });
  const sessionDetails = {
    ...mediaObject,
    playerName: config.mediaAnalytics.playerName,
    channel: config.mediaAnalytics.channel,
    appVersion: config.mediaAnalytics.version
  };
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
const createHeartbeat = ({
  frequency,
  playerState,
  trackMediaEvent,
  deferSession
}) => {
  // eslint-disable-next-line consistent-return
  return () => {
    const currentTime = Date.now();
    console.log("heartbeat", currentTime, playerState.latestTriggeredEvent);
    if (
      Math.abs(currentTime - playerState.latestTriggeredEvent) / 1000 >
      frequency
    ) {
      return deferSession.then(result => {
        const { sessionID } = result;

        return trackMediaEvent({
          xdm: {
            eventType: "ping",
            mediaCollection: {
              sessionID,
              playhead: playerState.playhead
            }
          }
        });
        console.log("result", result);
      });
    }
  };
};
const createMediaDetailsObject = () => {};

const createGetInstance = ({
  config,
  logger,
  getMediaSession,
  trackMediaEvent
}) => {
  const { mediaAnalytics } = config;
  const frequency = mediaAnalytics.heartbeatFrequency;
  const trackerState = {
    qoe: null,
    lastPlayhead: 0,
    latestTriggeredEvent: null
  };

  let ticker;

  let deferSession = defer();
  /*
  const trackEvent = createTrackEvent({
    deferSession,
    getMediaSession,
    trackerState
  });
*/
  const trackEvent = () => {};
  const heartbeatEngine = createHeartbeat({
    frequency,
    deferSession,
    playerState: trackerState,
    trackMediaEvent
  });

  return {
    trackSessionStart: (mediaObject, contextData = {}) => {
      const {
        mainPingInterval,
        adPingInterval
      } = mediaAnalytics.mainPingInterval;
      trackerState.latestTriggeredEvent = Date.now();

      const { sessionDetails, customMetadata } = createSessionDetails(
        mediaObject,
        contextData,
        config
      );
      const mediaCollection = {
        playhead: 0,
        sessionDetails,
        customMetadata
      };
      return getMediaSession({
        xdm: {
          eventType: "media.sessionStart",
          mediaCollection
        }
      }).then(result => {
        console.log("result", result);
        deferSession.resolve(result.sessionId);

        ticker = setInterval(() => {
          heartbeatEngine();
        }, 1000);
      });
    },
    trackPlay: () => {
      return trackEvent({
        type: Event.Play,
        playhead: 0
      });
    },
    trackPause: () => {
      return trackEvent({
        type: Event.Pause,
        playhead: trackerState.lastPlayhead
      });
    },
    trackSessionEnd: () => {
      clearInterval(ticker);
      return trackEvent({
        type: Event.SessionEnd,
        playhead: trackerState.lastPlayhead
      });
    },
    trackComplete: () => {
      clearInterval(ticker);
      return trackEvent({
        type: "sessionComplete",
        playhead: trackerState.lastPlayhead
      });
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

      return trackEvent({
        type: "error",
        playhead: trackerState.lastPlayhead,
        mediaDetails
      });
    },
    trackEvent: (eventType, info, context) => {
      const mediaDetails = createMediaDetailsObject(info, context);
      return trackEvent({
        type: eventType,
        playhead: trackerState.lastPlayhead,
        mediaDetails
      });
    },
    updatePlayhead: time => {
      // no event should be triggered to the MA edge
      trackerState.lastPlayhead = time;
    },
    updateQoEObject: () => {},
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
