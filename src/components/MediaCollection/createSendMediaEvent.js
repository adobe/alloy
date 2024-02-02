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
import MediaEvents from "./constants/eventTypes";

export default ({ mediaEventManager, mediaSessionCacheManager, config }) => {
  const sendMediaEvent = options => {
    const event = mediaEventManager.createMediaEvent({ options });
    const { playerId, xdm } = options;
    const eventType = xdm.eventType;
    const action = eventType.split(".")[1];
    const {
      getPlayerDetails,
      sessionPromise
    } = mediaSessionCacheManager.getSession(playerId);
    return sessionPromise.then(result => {
      mediaEventManager.augmentMediaEvent({
        event,
        playerId,
        getPlayerDetails,
        sessionID: result.sessionId
      });

      return mediaEventManager.trackMediaEvent({ event, action }).then(() => {
        if (playerId) {
          if (
            eventType === MediaEvents.SESSION_COMPLETE ||
            eventType === MediaEvents.SESSION_END
          ) {
            mediaSessionCacheManager.stopHeartbeat({ playerId });
          } else {
            const interval =
              eventType === MediaEvents.AD_START ||
              eventType === MediaEvents.Ad_BREAK_START
                ? config.mediaCollection.adPingInterval
                : config.mediaCollection.mainPingInterval;

            const heartbeatId = setTimeout(() => {
              const heartbeatOptions = {
                playerId,
                xdm: {
                  eventType: MediaEvents.PING
                }
              };
              sendMediaEvent(heartbeatOptions);
            }, interval * 1000);
            mediaSessionCacheManager.saveHeartbeat({
              playerId,
              heartbeatId
            });
          }
        }
      });
    });
  };

  return options => sendMediaEvent(options);
};
