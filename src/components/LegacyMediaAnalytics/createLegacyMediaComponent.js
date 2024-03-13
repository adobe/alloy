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

import { noop, uuid } from "../../utils";
import {
  AD_METADATA_KEYS as AdMetadataKeys,
  AUDIO_METADATA_KEYS as AudioMetadataKeys,
  EVENT as Event,
  MEDIA_OBJECT_KEYS as MediaObjectKey,
  MEDIA_TYPE as MediaType,
  PLAYER_STATE as PlayerState,
  STREAM_TYPE as StreamType,
  VIDEO_METADATA_KEYS as VideoMetadataKeys
} from "./constants/constants";

export default ({
  trackMediaEvent,
  trackMediaSession,
  mediaResponseHandler,
  logger,
  createMediaHelper,
  createGetInstance,
  config
}) => {
  return {
    lifecycle: {
      onBeforeEvent({ mediaOptions, onResponse = noop }) {
        if (!mediaOptions) {
          return;
        }
        const { legacy, playerId, getPlayerDetails } = mediaOptions;

        if (!legacy) {
          return;
        }
        onResponse(({ response }) => {
          return mediaResponseHandler({ playerId, getPlayerDetails, response });
        });
      }
    },
    commands: {
      getMediaAnalyticsTracker: {
        run: () => {
          if (!config.mediaCollection) {
            return Promise.reject(
              new Error("Media Collection is not configured.")
            );
          }
          logger.info("Media Collection is configured in legacy mode.");
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
