import { MEDIA_EVENTS } from "./media/constants";
import { isEmptyObject, isNumber, uuid } from "../../utils";
import { adsToXdmKeys, mediaToXdmKeys } from "./media/mediaKeysToXdmConverter";

export default ({ logger, trackMediaSession, trackMediaEvent }) => {
  let trackerState = {
    qoe: null,
    lastPlayhead: 0,
    playerId: uuid()
  };
  const getEventType = ({ eventType }) => {
    if (eventType === MEDIA_EVENTS.BufferComplete) {
      return MEDIA_EVENTS.Play;
    }
    if (
      eventType === MEDIA_EVENTS.StateStart ||
      eventType === MEDIA_EVENTS.StateEnd
    ) {
      return "statesUpdate";
    }
    return eventType;
  };
  const createXdmObject = ({
    eventType,
    mediaDetails = {},
    contextData = []
  }) => {
    const action = getEventType({ eventType });

    if (eventType === MEDIA_EVENTS.StateStart) {
      const xdm = {
        eventType: `media.${action}`,
        mediaCollection: {
          statesStart: [mediaDetails]
        }
      };
      return xdm;
    }
    if (eventType === MEDIA_EVENTS.StateEnd) {
      const xdm = {
        eventType: `media.${action}`,
        mediaCollection: {
          statesEnd: [mediaDetails]
        }
      };
      return xdm;
    }
    const xdm = {
      eventType: `media.${action}`,
      mediaCollection: {
        ...mediaDetails
      }
    };

    const customMetadata = [];
    Object.keys(contextData).forEach(key => {
      if (mediaToXdmKeys[key]) {
        xdm.mediaCollection.sessionDetails[mediaToXdmKeys[key]] =
          contextData[key];
      } else if (adsToXdmKeys[key]) {
        xdm.mediaCollection.advertisingDetails[adsToXdmKeys[key]] =
          contextData[key];
      } else {
        customMetadata.push({
          name: key,
          value: contextData[key]
        });
      }
    });

    xdm.mediaCollection.customMetadata = customMetadata;
    return xdm;
  };

  return {
    trackSessionStart: (mediaObject, contextData = {}) => {
      if (isEmptyObject(mediaObject)) {
        logger.info("Invalid media object");
        return {};
      }
      const xdm = createXdmObject({
        eventType: "sessionStart",
        mediaDetails: mediaObject,
        contextData
      });

      return trackMediaSession({
        playerId: trackerState.playerId,
        getPlayerDetails: () => {
          return {
            playhead: trackerState.lastPlayhead,
            qoeDataDetails: trackerState.qoe
          };
        },
        xdm
      });
    },
    trackPlay: () => {
      if (trackerState === null) {
        logger.info("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({ eventType: MEDIA_EVENTS.Play });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackPause: () => {
      if (trackerState === null) {
        logger.info("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({ eventType: MEDIA_EVENTS.Pause });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackSessionEnd: () => {
      if (trackerState === null) {
        logger.info("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({ eventType: MEDIA_EVENTS.SessionEnd });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackComplete: () => {
      if (trackerState === null) {
        logger.info("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({ eventType: MEDIA_EVENTS.SessionComplete });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackError: errorId => {
      logger.info(`trackError(${errorId})`);
      if (trackerState === null) {
        logger.info("The Media Session was completed.");
        return {};
      }

      const errorDetails = {
        name: errorId,
        source: "player"
      };

      const xdm = createXdmObject({
        eventType: MEDIA_EVENTS.Error,
        mediaDetails: { errorDetails }
      });
      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackEvent: (eventType, info, context) => {
      if (isEmptyObject(info) || trackerState === null) {
        // TODO: or eventType is not in MEDIA_EVENTS
        logger.info("Invalid media object or the session was terminated.");
        return {};
      }
      const xdm = createXdmObject({
        eventType,
        mediaDetails: info,
        contextData: context
      });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    updatePlayhead: time => {
      if (trackerState === null) {
        logger.info("The Media Session was completed.");
        return;
      }

      if (isNumber(time)) {
        trackerState.lastPlayhead = parseInt(time, 10);
      }
    },
    updateQoEObject: qoeObject => {
      if (trackerState === null) {
        logger.info("The Media Session was completed.");
        return;
      }

      if (!qoeObject) {
        return;
      }
      trackerState.qoe = qoeObject;
    },
    destroy: () => {
      logger.info("Destroy called, destroying the tracker");
      trackerState = null;
    }
  };
};
