import defer from "../../utils/defer";
import createTrackEvent from "./createTrackEvent";
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
const createHeartbeat = ({ frequency, playerState, trackEvent }) => {
  // eslint-disable-next-line consistent-return
  return () => {
    const currentTime = Date.now();
    console.log("heartbeat", currentTime, playerState.latestTriggeredEvent);
    if (
      Math.abs(currentTime - playerState.latestTriggeredEvent) / 1000 >
      frequency
    ) {
      return trackEvent({
        type: "ping",
        playhead: playerState.lastPlayhead
      });
    }
  };
};
const createMediaDetailsObject = () => {};

const createGetInstance = ({
  config,
  logger,
  sendEdgeNetworkRequest,
  eventManager
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
  const trackEvent = createTrackEvent({
    deferSession,
    sendEdgeNetworkRequest,
    trackerState
  });

  const heartbeatEngine = createHeartbeat({
    frequency,
    playerState: trackerState,
    trackEvent
  });

  return {
    trackSessionStart: (mediaObject, contextData = {}) => {
      const heartbeat = mediaAnalytics.heartbeatFrequency;
      trackerState.latestTriggeredEvent = Date.now();

      const event = eventManager.createEvent();
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
      event.mergeXdm({ eventType: "media.sessionStart", mediaCollection });
      return eventManager.sendEvent(event).then(result => {
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
  sendEdgeNetworkRequest,
  eventManager
}) => {
  logger.info("Media Analytics Component was configured");

  return {
    getInstance: () => {
      return createGetInstance({
        config,
        logger,
        sendEdgeNetworkRequest,
        eventManager
      });
    },
    createMediaHelper
  };
};
