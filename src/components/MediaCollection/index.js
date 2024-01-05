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

import { string, number, objectOf } from "../../utils/validation";
import createMediaSessionCacheManager from "./createMediaSessionCacheManager";
import validateMediaEventOptions from "./validateMediaEventOptions";
import validateSessionOptions from "./validateMediaSessionOptions";
import createMediaEventManager from "./createMediaEventManager";
import { noop } from "../../utils";
import createHeartbeatEngine from "./createHeartbeatEngine";
import createUpdateMediaSessionState from "./createUpdateMediaSessionState";

const createMediaCollection = ({
  config,
  logger,
  eventManager,
  sendEdgeNetworkRequest,
  consent
}) => {
  const mediaSessionCacheManager = createMediaSessionCacheManager({ config });
  const mediaEventManager = createMediaEventManager({
    config,
    eventManager,
    logger,
    consent,
    sendEdgeNetworkRequest
  });

  const heartbeatTicker = createHeartbeatEngine({
    config,
    mediaEventManager,
    mediaSessionCacheManager
  });

  const updateMediaSessionState = createUpdateMediaSessionState({
    mediaSessionCacheManager
  });

  return {
    lifecycle: {
      onBeforeEvent({ playerId, onBeforeMediaEvent, onResponse = noop }) {
        onResponse(({ response }) => {
          const sessionId = response.getPayloadsByType(
            "media-analytics:new-session"
          );
          logger.info("Media session ID returned: ", sessionId);

          if (sessionId.length > 0) {
            if (playerId && onBeforeMediaEvent) {
              const heartbeatId = setInterval(() => {
                heartbeatTicker({
                  sessionId: sessionId[0].sessionId,
                  playerId,
                  onBeforeMediaEvent
                });
              }, 1000);
              mediaSessionCacheManager.saveHeartbeat({ playerId, heartbeatId });
            }
            return { sessionId: sessionId[0].sessionId };
          }

          return {};
        });
      }
    },
    commands: {
      createMediaSession: {
        optionsValidator: options => validateSessionOptions({ options }),
        run: options => {
          const { playerId, onBeforeMediaEvent } = options;
          const event = mediaEventManager.createMediaSession(options);
          mediaEventManager.augmentMediaEvent({
            event,
            playerId,
            onBeforeMediaEvent
          });

          const sessionPromise = mediaEventManager.trackMediaSession({
            event,
            playerId,
            onBeforeMediaEvent
          });

          mediaSessionCacheManager.storeSession({
            playerId,
            sessionDetails: {
              sessionPromise,
              onBeforeMediaEvent,
              latestTriggeredEvent: Date.now()
            }
          });

          return sessionPromise;
        }
      },
      sendMediaEvent: {
        optionsValidator: options => validateMediaEventOptions({ options }),
        run: options => {
          const event = mediaEventManager.createMediaEvent({ options });
          const { playerId, xdm } = options;
          const eventType = xdm.eventType;
          const action = eventType.split(".")[1];
          const {
            onBeforeMediaEvent,
            sessionPromise
          } = mediaSessionCacheManager.getSession(playerId);
          sessionPromise.then(result => {
            mediaEventManager.augmentMediaEvent({
              event,
              playerId,
              onBeforeMediaEvent,
              sessionID: result.sessionId
            });

            return mediaEventManager
              .trackMediaEvent({ event, action })
              .then(() => {
                updateMediaSessionState({ playerId, eventType });
              })
              .catch(error => {
                logger.warn(`The Media Event of type ${action} failed.`, error);
              });
          });
        }
      }
    }
  };
};

createMediaCollection.namespace = "Media Collection";

createMediaCollection.configValidators = objectOf({
  mediaCollection: objectOf({
    channel: string()
      .nonEmpty()
      .required(),
    playerName: string()
      .nonEmpty()
      .required(),
    version: string(),
    mainPingInterval: number()
      .minimum(10)
      .maximum(50)
      .default(10),
    adPingInterval: number()
      .minimum(10)
      .maximum(50)
      .default(10)
  }).noUnknownFields()
});
export default createMediaCollection;
