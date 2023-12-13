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

import toInteger from "../../utils/toInteger";

export default ({ config, mediaEventManager, mediaSessionCacheManager }) => {
  return ({ playerId, sessionId, onBeforeMediaEvent }) => {
    const currentTime = Date.now();
    const { mainPingInterval } = config.mediaCollection;

    const playerSession = mediaSessionCacheManager.getSession(playerId);
    if (
      Math.abs(currentTime - playerSession.latestTriggeredEvent) / 1000 >
      mainPingInterval
    ) {
      const { playhead, qoeDataDetails } = onBeforeMediaEvent(playerId);
      const xdm = {
        eventType: "media.ping",
        mediaCollection: {
          playhead: toInteger(playhead),
          sessionID: sessionId,
          qoeDataDetails
        }
      };
      const event = mediaEventManager.createMediaEvent({ options: { xdm } });
      return mediaEventManager
        .trackMediaEvent({
          event
        })
        .then(() => {
          mediaSessionCacheManager.updateLastTriggeredEventTS({ playerId });
        });
    }
    return Promise.resolve();
  };
};
