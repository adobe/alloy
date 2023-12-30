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
import MediaEvent from "./constants/eventTypes";

const ACTION = "ping";

const getCurrentInterval = playerSession => {
  const currentTime = Date.now();

  return Math.abs(currentTime - playerSession.latestTriggeredEvent) / 1000;
};

export default ({ config, mediaEventManager, mediaSessionCacheManager }) => {
  return ({ playerId, sessionId, onBeforeMediaEvent }) => {
    const { mainPingInterval } = config.mediaCollection;
    const playerSession = mediaSessionCacheManager.getSession(playerId);
    const currentInterval = getCurrentInterval(playerSession);

    if (currentInterval > mainPingInterval) {
      const { playhead, qoeDataDetails } = onBeforeMediaEvent(playerId);
      const xdm = {
        eventType: MediaEvent.PING,
        mediaCollection: {
          playhead: toInteger(playhead),
          sessionID: sessionId,
          qoeDataDetails
        }
      };
      const event = mediaEventManager.createMediaEvent({ options: { xdm } });

      return mediaEventManager
        .trackMediaEvent({
          event,
          action: ACTION
        })
        .then(() => {
          mediaSessionCacheManager.updateLastTriggeredEventTS({ playerId });
        });
    }

    return Promise.resolve();
  };
};
