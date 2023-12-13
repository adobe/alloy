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
  AdMetadataKeys,
  AudioMetadataKeys,
  mediaEvent as Event,
  MediaObjectKey,
  MediaType,
  PlayerState,
  StreamType,
  VideoMetadataKeys
} from "./media/constants";
import { deepAssign, isEmptyObject, isNumber } from "../../utils";
import { adsToXdmKeys, mediaToXdmKeys } from "./media/mediaKeysToXdmConverter";
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

const createGetInstance = ({ config, logger, mediaEventManager }) => {
  const { mainPingInterval } = config.mediaCollection;

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
  const getEventType = ({ eventType }) => {
    if (eventType === Event.BufferComplete) {
      return `media.${Event.Play}`;
    }
    return `media.${eventType}`;
  };

  const trackEvent = ({ eventType, mediaDetails }) => {
    return deferSession.promise
      .then(sessionID => {
        const xdm = {
          eventType: getEventType({ eventType }),
          mediaCollection: {
            sessionID,
            playhead: trackerState.lastPlayhead
          }
        };
        deepAssign(xdm.mediaCollection, mediaDetails);
        const event = mediaEventManager.createMediaEvent({ options: { xdm } });
        return mediaEventManager.trackMediaEvent({ event }).then(() => {
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
      const event = mediaEventManager.createMediaSession({
        xdm: {
          mediaCollection
        }
      });

      return mediaEventManager
        .trackMediaSession({
          event
        })
        .then(result => {
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
  mediaEventManager
}) => {
  logger.info("Media Analytics Component was configured");

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
    createMediaObject,
    createAdBreakObject,
    createAdObject,
    createChapterObject,
    createStateObject,
    createQoEObject
  };
};
