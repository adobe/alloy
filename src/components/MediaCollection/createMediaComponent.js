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
import { noop } from "../../utils";
import validateSessionOptions from "./validateMediaSessionOptions";
import validateMediaEventOptions from "./validateMediaEventOptions";
import isBlankString from "../../utils/isBlankString";
import MediaEvents from "./constants/eventTypes";

export default ({
  config,
  logger,
  trackMediaEvent,
  mediaEventManager,
  mediaSessionCacheManager
}) => {
  return {
    lifecycle: {
      onBeforeEvent({ playerId, getPlayerDetails, onResponse = noop }) {
        onResponse(({ response }) => {
          const mediaPayload = response.getPayloadsByType(
            "media-analytics:new-session"
          );

          logger.info("Media payload returned: ", mediaPayload);

          const { sessionId } = mediaPayload[0];
          if (isBlankString(sessionId)) {
            return {};
          }

          if (!playerId || !getPlayerDetails) {
            return { sessionId };
          }

          const heartbeatId = setTimeout(() => {
            trackMediaEvent({
              playerId,
              xdm: {
                eventType: MediaEvents.PING
              }
            });
          }, config.mediaCollection.mainPingInterval * 1000);

          mediaSessionCacheManager.saveHeartbeat({ playerId, heartbeatId });

          return { sessionId };
        });
      }
    },
    commands: {
      createMediaSession: {
        optionsValidator: options => validateSessionOptions({ options }),

        run: options => {
          if (!config.mediaCollection) {
            logger.warn("Media Collection is not configured.");

            return Promise.resolve();
          }

          const { playerId, getPlayerDetails } = options;
          const event = mediaEventManager.createMediaSession(options);

          mediaEventManager.augmentMediaEvent({
            event,
            playerId,
            getPlayerDetails
          });

          const sessionPromise = mediaEventManager.trackMediaSession({
            event,
            playerId,
            getPlayerDetails
          });

          mediaSessionCacheManager.storeSession({
            playerId,
            sessionDetails: {
              sessionPromise,
              getPlayerDetails
            }
          });

          return sessionPromise;
        }
      },

      sendMediaEvent: {
        optionsValidator: options => validateMediaEventOptions({ options }),

        run: options => {
          if (!config.mediaCollection) {
            logger.warn("Media Collection is not configured.");

            return Promise.resolve();
          }

          const { xdm } = options;
          const eventType = xdm.eventType;

          return trackMediaEvent(options).catch(error => {
            logger.warn(`The Media Event of type ${eventType} failed.`, error);
          });
        }
      }
    }
  };
};
