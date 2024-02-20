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
/* eslint-disable import/no-restricted-paths */

import createMediaEventManager from "../MediaCollection/createMediaEventManager";
import createMediaSessionCacheManager from "../MediaCollection/createMediaSessionCacheManager";
import createTrackMediaEvent from "../MediaCollection/createTrackMediaEvent";
import createTrackMediaSession from "../MediaCollection/createTrackMediaSession";
import createMediaHelper from "./createMediaHelper";
import {
  AD_METADATA_KEYS as AdMetadataKeys,
  AUDIO_METADATA_KEYS as AudioMetadataKeys,
  EVENT as Event,
  MEDIA_OBJECT_KEYS as MediaObjectKey,
  MEDIA_TYPE as MediaType,
  PLAYER_STATE as PlayerState,
  STREAM_TYPE as StreamType,
  VIDEO_METADATA_KEYS as VideoMetadataKeys
} from "./media/constants";
import createGetInstance from "./createGetInstance";
import { noop, uuid } from "../../utils";
import createOnBeforeMediaEvent from "../MediaCollection/createOnBeforeMediaEvent";

const createLegacyMediaAnalytics = ({
  eventManager,
  sendEdgeNetworkRequest,
  config,
  logger,
  consent
}) => {
  const mediaSessionCacheManager = createMediaSessionCacheManager({ config });

  const mediaEventManager = createMediaEventManager({
    sendEdgeNetworkRequest,
    config,
    logger,
    consent,
    eventManager
  });

  const trackMediaEvent = createTrackMediaEvent({
    mediaSessionCacheManager,
    mediaEventManager,
    config
  });
  const trackMediaSession = createTrackMediaSession({
    config,
    logger,
    mediaEventManager,
    mediaSessionCacheManager,
    legacy: true
  });
  const onBeforeMediaEvent = createOnBeforeMediaEvent({
    mediaSessionCacheManager,
    logger,
    config,
    trackMediaEvent
  });
  return {
    lifecycle: {
      onBeforeEvent({ mediaOptions, onResponse = noop }) {
        const { legacy, playerId, getPlayerDetails } = mediaOptions;

        if (!legacy) {
          return;
        }
        onResponse(({ response }) => {
          return onBeforeMediaEvent({ playerId, getPlayerDetails, response });
        });
      }
    },
    commands: {
      getMediaAnalyticsTracker: {
        run: () => {
          if (!config.mediaCollection) {
            logger.warn("Media Collection is not configured.");
          }

          logger.info("Media Analytics Legacy Component was configured");

          const mediaAnalyticsHelper = createMediaHelper({ logger });

          return Promise.resolve({
            getInstance: () => {
              return createGetInstance({
                logger,
                trackMediaEvent,
                trackMediaSession,
                uuid
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
          });
        }
      }
    }
  };
};

createLegacyMediaAnalytics.namespace = "Legacy Media Analytics";

export default createLegacyMediaAnalytics;
