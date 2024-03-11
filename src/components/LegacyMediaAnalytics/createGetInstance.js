/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { MEDIA_EVENTS } from "./constants/constants";
import { isEmptyObject, isNonEmptyArray, isNumber } from "../../utils";
import {
  adsToXdmKeys,
  mediaToXdmKeys
} from "./constants/mediaKeysToXdmConverter";

export default ({ logger, trackMediaSession, trackMediaEvent, uuid }) => {
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
    if (isNonEmptyArray(customMetadata)) {
      xdm.mediaCollection.customMetadata = customMetadata;
    }

    return xdm;
  };

  return {
    trackSessionStart: (mediaObject, contextData = {}) => {
      if (isEmptyObject(mediaObject)) {
        logger.debug("Invalid media object");
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
        logger.debug("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({ eventType: MEDIA_EVENTS.Play });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackPause: () => {
      if (trackerState === null) {
        logger.debug("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({ eventType: MEDIA_EVENTS.Pause });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackSessionEnd: () => {
      if (trackerState === null) {
        logger.debug("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({ eventType: MEDIA_EVENTS.SessionEnd });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackComplete: () => {
      if (trackerState === null) {
        logger.debug("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({ eventType: MEDIA_EVENTS.SessionComplete });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackError: errorId => {
      logger.debug(`trackError(${errorId})`);
      if (trackerState === null) {
        logger.debug("The Media Session was completed.");
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
        logger.debug("Invalid media object or the session was terminated.");
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
        logger.debug("The Media Session was completed.");
        return;
      }

      if (isNumber(time)) {
        trackerState.lastPlayhead = parseInt(time, 10);
      }
    },
    updateQoEObject: qoeObject => {
      if (trackerState === null) {
        logger.debug("The Media Session was completed.");
        return;
      }

      if (!qoeObject) {
        return;
      }
      trackerState.qoe = qoeObject;
    },
    destroy: () => {
      logger.debug("Destroy called, destroying the tracker");
      trackerState = null;
    }
  };
};
