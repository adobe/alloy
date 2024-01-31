/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import defer from "../../utils/defer";
import {
  AD_METADATA_KEYS as AdMetadataKeys,
  AUDIO_METADATA_KEYS as AudioMetadataKeys,
  EVENT as Event,
  PLAYER_STATE as PlayerState,
  STREAM_TYPE as StreamType,
  MEDIA_OBJECT_KEYS as MediaObjectKey,
  VIDEO_METADATA_KEYS as VideoMetadataKeys,
  MEDIA_TYPE as MediaType,
  MEDIA_EVENTS
} from "./media/constants";
import { deepAssign, isEmptyObject, isNumber } from "../../utils";
import { adsToXdmKeys, mediaToXdmKeys } from "./media/mediaKeysToXdmConverter";
import createMediaHelper from "./createMediaHelper";

const createSessionStartXdmObject = (mediaObject, contextData) => {
  const customMetadata = [];
  const { sessionDetails } = mediaObject;
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

  return {
    xdm: {
      mediaCollection: {
        playhead: 0,
        sessionDetails,
        customMetadata
      }
    }
  };
};

const addAdStartContextToMediaDetails = (
  context,
  mediaDetails,
  customMetadata
) => {
  Object.keys(context).forEach(key => {
    if (adsToXdmKeys[key]) {
      mediaDetails.advertisingDetails[adsToXdmKeys[key]] = context[key];
    } else {
      customMetadata.push({
        name: key,
        value: context[key]
      });
    }
  });
};

const addContextToCustomMetadata = (context, customMetadata) => {
  Object.keys(context).forEach(key => {
    customMetadata.push({
      name: key,
      value: context[key]
    });
  });
};
const createMediaDetailsObject = ({ eventType, info, context }) => {
  const mediaDetails = info;
  const customMetadata = [];

  if (!context || isEmptyObject(context)) {
    return mediaDetails;
  }

  if (eventType === MEDIA_EVENTS.AdStart) {
    addAdStartContextToMediaDetails(context, mediaDetails, customMetadata);
  } else {
    addContextToCustomMetadata(context, customMetadata);
  }

  mediaDetails.customMetadata = customMetadata;

  return mediaDetails;
};

const createGetInstance = ({ config, logger, mediaEventManager }) => {
  const trackerState = {
    qoe: null,
    lastPlayhead: 0,
    ticker: null,
    deferSession: defer()
  };

  const getEventType = ({ eventType }) => {
    if (eventType === MEDIA_EVENTS.BufferComplete) {
      return MEDIA_EVENTS.Play;
    }
    return eventType;
  };
  const createXdmObject = ({ eventType, mediaDetails, sessionID }) => {
    const action = getEventType({ eventType });
    const xdm = {
      eventType: `media.${action}`,
      mediaCollection: {
        sessionID,
        playhead: trackerState.lastPlayhead
      }
    };
    deepAssign(xdm.mediaCollection, mediaDetails);
    return xdm;
  };

  const createAndTrackMediaEvent = ({ xdm, action }) => {
    const event = mediaEventManager.createMediaEvent({ options: { xdm } });
    return mediaEventManager.trackMediaEvent({ event, action });
  };
  const createAndTrackMediaSession = ({ xdm }) => {
    const event = mediaEventManager.createMediaSession(xdm);
    return mediaEventManager.trackMediaSession({ event });
  };

  const setTicker = ({ func, eventType }) => {
    clearTimeout(trackerState.ticker);
    const pingInterval =
      eventType === MEDIA_EVENTS.AdStart ||
      eventType === MEDIA_EVENTS.AdBreakStart
        ? config.mediaCollection.adPingInterval
        : config.mediaCollection.mainPingInterval;
    trackerState.ticker = setTimeout(() => {
      func({ eventType: "ping" });
    }, pingInterval * 1000);
  };

  const trackEvent = ({ eventType, mediaDetails }) => {
    return trackerState.deferSession.promise
      .then(sessionID => {
        const xdm = createXdmObject({ eventType, mediaDetails, sessionID });
        return createAndTrackMediaEvent({
          xdm,
          action: getEventType({ eventType })
        });
      })
      .then(setTicker({ func: trackEvent, eventType }))
      .catch(error => {
        logger.warn(
          `An error occurred while sending ${eventType} Media Event.`,
          error
        );
      });
  };

  return {
    trackSessionStart: (mediaObject, contextData = {}) => {
      if (isEmptyObject(mediaObject)) {
        trackerState.deferSession.reject("invalid media object");
        return {};
      }
      const xdm = createSessionStartXdmObject(mediaObject, contextData);

      return createAndTrackMediaSession({ xdm }).then(result => {
        if (result.sessionId) {
          trackerState.deferSession.resolve(result.sessionId);
          setTicker({ func: trackEvent });
        } else {
          trackerState.deferSession.reject(
            "There was an error when creating the session.Thus no more media events are triggered."
          );
        }
      });
    },
    trackPlay: () => {
      return trackEvent({ eventType: MEDIA_EVENTS.Play });
    },
    trackPause: () => {
      return trackEvent({ eventType: MEDIA_EVENTS.Pause });
    },
    trackSessionEnd: () => {
      clearInterval(trackerState.ticker);
      return trackEvent({ eventType: MEDIA_EVENTS.SessionEnd }).then(() => {
        trackerState.deferSession = null;
      });
    },
    trackComplete: () => {
      clearInterval(trackerState.ticker);
      return trackEvent({ eventType: MEDIA_EVENTS.SessionComplete });
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
      return trackEvent({ eventType: MEDIA_EVENTS.SessionEnd, mediaDetails });
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
      clearInterval(trackerState.ticker);
      trackerState.deferSession = null;
    }
  };
};

export const createMediaAnalyticsTracker = ({
  config,
  logger,
  mediaEventManager
}) => {
  logger.info("Media Analytics Component was configured");
  const mediaAnalyticsHelper = createMediaHelper({ logger });

  return {
    getInstance: () => {
      return createGetInstance({
        config,
        logger,
        mediaEventManager
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
    ...mediaAnalyticsHelper
  };
};
