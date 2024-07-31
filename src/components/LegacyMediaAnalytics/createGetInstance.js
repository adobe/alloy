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
import { EVENT, MEDIA_EVENTS_INTERNAL } from "./constants/constants.js";
import {
  isEmptyObject,
  isNil,
  isNonEmptyArray,
  isNumber,
} from "../../utils/index.js";
import {
  adsToXdmKeys,
  mediaToXdmKeys,
} from "./constants/mediaKeysToXdmConverter.js";

export default ({ logger, trackMediaSession, trackMediaEvent, uuid }) => {
  let trackerState = null;
  const instantiateTracker = () => {
    trackerState = {
      qoe: null,
      lastPlayhead: 0,
      playerId: uuid(),
    };
  };
  const getEventType = ({ eventType }) => {
    if (
      eventType === EVENT.BufferComplete ||
      eventType === EVENT.SeekComplete
    ) {
      return MEDIA_EVENTS_INTERNAL.Play;
    }
    if (eventType === EVENT.StateStart || eventType === EVENT.StateEnd) {
      return MEDIA_EVENTS_INTERNAL.StateUpdate;
    }
    if (eventType === EVENT.SeekStart) {
      return MEDIA_EVENTS_INTERNAL.Pause;
    }
    return eventType;
  };
  const createXdmObject = ({
    eventType,
    mediaDetails = {},
    contextData = [],
  }) => {
    const action = getEventType({ eventType });

    if (eventType === EVENT.StateStart) {
      const xdm = {
        eventType: `media.${action}`,
        mediaCollection: {
          statesStart: [mediaDetails],
        },
      };
      return xdm;
    }
    if (eventType === EVENT.StateEnd) {
      const xdm = {
        eventType: `media.${action}`,
        mediaCollection: {
          statesEnd: [mediaDetails],
        },
      };
      return xdm;
    }
    const xdm = {
      eventType: `media.${action}`,
      mediaCollection: {
        ...mediaDetails,
      },
    };

    const customMetadata = [];
    Object.keys(contextData).forEach((key) => {
      if (mediaToXdmKeys[key]) {
        xdm.mediaCollection.sessionDetails[mediaToXdmKeys[key]] =
          contextData[key];
      } else if (adsToXdmKeys[key]) {
        xdm.mediaCollection.advertisingDetails[adsToXdmKeys[key]] =
          contextData[key];
      } else {
        customMetadata.push({
          name: key,
          value: contextData[key],
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
      if (isNil(mediaObject) || isEmptyObject(mediaObject)) {
        logger.warn("Invalid media object");
        return {};
      }
      if (trackerState === null) {
        logger.warn(
          "The Media Session was completed. Restarting a new session.",
        );
        instantiateTracker();
      }
      const xdm = createXdmObject({
        eventType: MEDIA_EVENTS_INTERNAL.SessionStart,
        mediaDetails: mediaObject,
        contextData,
      });

      return trackMediaSession({
        playerId: trackerState.playerId,
        getPlayerDetails: () => {
          return {
            playhead: trackerState.lastPlayhead,
            qoeDataDetails: trackerState.qoe,
          };
        },
        xdm,
      });
    },
    trackPlay: () => {
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({ eventType: MEDIA_EVENTS_INTERNAL.Play });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackPause: () => {
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({ eventType: MEDIA_EVENTS_INTERNAL.Pause });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackSessionEnd: () => {
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({
        eventType: MEDIA_EVENTS_INTERNAL.SessionEnd,
      });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackComplete: () => {
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({
        eventType: MEDIA_EVENTS_INTERNAL.SessionComplete,
      });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackError: (errorId) => {
      logger.warn(`trackError(${errorId})`);
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return {};
      }

      const errorDetails = {
        name: errorId,
        source: "player",
      };

      const xdm = createXdmObject({
        eventType: MEDIA_EVENTS_INTERNAL.Error,
        mediaDetails: { errorDetails },
      });
      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackEvent: (eventType, info, context) => {
      if (isEmptyObject(info)) {
        logger.warn("Invalid media object.");
        return {};
      }
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return {};
      }
      if (!Object.values(EVENT).includes(eventType)) {
        logger.warn("Invalid event type");
        return {};
      }
      const xdm = createXdmObject({
        eventType,
        mediaDetails: info,
        contextData: context,
      });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    updatePlayhead: (time) => {
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return;
      }

      if (isNumber(time)) {
        trackerState.lastPlayhead = parseInt(time, 10);
      }
    },
    updateQoEObject: (qoeObject) => {
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return;
      }

      if (!qoeObject) {
        return;
      }
      trackerState.qoe = qoeObject;
    },
    destroy: () => {
      logger.warn("Destroy called, destroying the tracker.");
      trackerState = null;
    },
  };
};
