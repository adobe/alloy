/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { string, number, objectOf } from "../../utils/validation";
import createTrackMediaEvent from "./createTrackMediaEvent";
import createPlayerCacheManager from "./createPlayerCacheManager";
import validateMediaEventOptions from "./validateMediaEventOptions";
import validateSessionOptions from "./validateMediaSessionOptions";
import createGetMediaSession from "./createGetMediaSession";
import createHeartbeatTicker from "./createHeartbeatTicker";
import automaticMediaSessionHandler from "./automaticMediaSessionHandler";

const createMediaAnalytics = ({
  config,
  logger,
  eventManager,
  sendEdgeNetworkRequest
}) => {
  const playerCache = createPlayerCacheManager();

  const trackMediaEvent = createTrackMediaEvent({
    playerCache,
    sendEdgeNetworkRequest,
    config,
    logger
  });
  const heartbeatTicker = createHeartbeatTicker({
    config,
    trackMediaEvent,
    playerCache
  });
  const automaticSessionHandler = automaticMediaSessionHandler({
    eventManager,
    heartbeatTicker,
    playerCache
  });
  const getMediaSession = createGetMediaSession({
    config,
    logger,
    eventManager,
    playerCache,
    heartbeatTicker,
    automaticSessionHandler
  });
  return {
    lifecycle: {
      onResponse({ response }) {
        const sessionId = response.getPayloadsByType(
          "media-analytics:new-session"
        );
        logger.info("MA session ID returned: ", sessionId);

        if (sessionId.length > 0) {
          return { sessionId: sessionId[0].sessionId };
        }

        return {};
      }
    },
    commands: {
      createMediaSession: {
        optionsValidator: options => validateSessionOptions({ options }),
        run: getMediaSession
      },
      sendMediaEvent: {
        optionsValidator: options => validateMediaEventOptions({ options }),
        run: trackMediaEvent
      }
    }
  };
};

createMediaAnalytics.namespace = "Media Analytics";

createMediaAnalytics.configValidators = objectOf({
  mediaAnalytics: objectOf({
    channel: string()
      .nonEmpty()
      .required(),
    playerName: string()
      .nonEmpty()
      .required(),
    version: string()
      .nonEmpty()
      .required(),
    mainPingInterval: number()
      .minimum(10)
      .default(10),
    adPingInterval: number()
      .minimum(1)
      .default(1)
  })
});
export default createMediaAnalytics;
