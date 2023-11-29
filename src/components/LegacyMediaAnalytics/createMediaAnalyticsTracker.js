import defer from "../../utils/defer";
import {
  AdMetadataKeys,
  AudioMetadataKeys,
  mediaEvent as Event,
  MediaObjectKey,
  MediaType,
  PlayerState,
  StreamType,
  VideoMetadataKeys
} from "./Media/constants";
import { deepAssign, isEmptyObject, isNumber } from "../../utils";
import { adsToXdmKeys, mediaToXdmKeys } from "./Media/mediaKeysToXdmConverter";
import {
  createMediaObject,
  createAdBreakObject,
  createAdObject,
  createChapterObject,
  createStateObject,
  createQoEObject
} from "./createMediaHelper";

const convertSessionDetailsMetadataToXDM = contextData => {
  const customMetadata = [];
  const sessionDetails = {};
  Object.keys(contextData).forEach(key => {
    if (mediaToXdmKeys[key]) {
      sessionDetails[mediaToXdmKeys[key]] = contextData[key];
    } else {
      customMetadata.push({
        name: key,
        value: contextData[key]
      });
    }
  });

  return { sessionDetails, customMetadata };
};

const createMediaDetailsObject = ({ eventType, info, context }) => {
  const mediaDetails = info;
  const customMetadata = [];

  if (context && !isEmptyObject(context)) {
    if (eventType === Event.AdStart) {
      Object.keys(context).forEach(key => {
        if (adsToXdmKeys[key]) {
          mediaDetails.advertisingDetails[mediaToXdmKeys[key]] = context[key];
        } else {
          customMetadata.push({
            name: key,
            value: context[key]
          });
        }
      });
    } else {
      Object.keys(context).forEach(key => {
        customMetadata.push({
          name: key,
          value: context[key]
        });
      });
    }
    mediaDetails.customMetadata = customMetadata;
  }

  return mediaDetails;
};

const createHeartbeat = ({ mainPingInterval, playerState, trackEvent }) => {
  // eslint-disable-next-line consistent-return
  return () => {
    const currentTime = Date.now();
    if (
      Math.abs(currentTime - playerState.latestTriggeredEvent) / 1000 >
      mainPingInterval
    ) {
      return trackEvent({ eventType: "ping" });
    }
  };
};

const createGetInstance = ({
  config,
  logger,
  getMediaSession,
  trackMediaEvent
}) => {
  const mediaCollectionConfig = config.mediaCollection;
  const { mainPingInterval } = mediaCollectionConfig;
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
        const xdm = {
          eventType: `media.${eventType}`,
          mediaCollection: {
            sessionID,
            playhead: trackerState.lastPlayhead
          }
        };
        deepAssign(xdm.mediaCollection, mediaDetails);

        return trackMediaEvent({ xdm }).then(() => {
          updateLastTimeEventTriggered();
        });
      })
      .catch(error => {
        logger.info(error);
      });
  };

  const heartbeatEngine = createHeartbeat({
    mainPingInterval,
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
      const {
        sessionDetails,
        customMetadata
      } = convertSessionDetailsMetadataToXDM(contextData);

      deepAssign(
        mediaCollection,
        mediaObject,
        { sessionDetails },
        { customMetadata }
      );
      return getMediaSession({
        xdm: {
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
      return trackEvent({ eventType: Event.SessionEnd }).then(() => {
        deferSession = null;
      });
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
      if (isEmptyObject(info)) {
        logger.info("invalid media object");
        return {};
      }
      const mediaDetails = createMediaDetailsObject({
        eventType,
        info,
        context
      });

      return trackEvent({
        eventType,
        mediaDetails
      });
    },
    updatePlayhead: time => {
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
      deferSession = null;
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
    Event,
    MediaType,
    PlayerState,
    StreamType,
    MediaObjectKey,
    VideoMetadataKeys,
    AudioMetadataKeys,
    AdMetadataKeys,
    createMediaObject,
    createAdBreakObject,
    createAdObject,
    createChapterObject,
    createStateObject,
    createQoEObject
  };
};
