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
import createPlayerCacheManager from "./createPlayerCache";
import validateMediaEventOptions from "./validateMediaEventOptions";
import validateSessionOptions from "./validateMediaSessionOptions";
import createGetMediaSession from "./createGetMediaSession";
import createHeartbeatTicker from "./createHeartbeatTicker";
import automaticMediaSessionHandler from "./automaticMediaSessionHandler";
import createMediaEventProcesor from "./createMediaEventProcessor";
import automaticMediaHandler from "./automaticMediaHandler";

const createMediaCollection = ({
  config,
  logger,
  eventManager,
  sendEdgeNetworkRequest,
  consent
}) => {
  const playerCache = createPlayerCacheManager();
  const postProcessMediaEvent = createMediaEventProcesor({
    playerCache
  });
  const handleMediaEventAutomatically = automaticMediaHandler({
    playerCache,
    sendEdgeNetworkRequest,
    postProcessMediaEvent,
    consent
  });
  const trackMediaEvent = createTrackMediaEvent({
    sendEdgeNetworkRequest,
    handleMediaEventAutomatically,
    config,
    logger,
    consent
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
    eventManager,
    automaticSessionHandler,
    logger
  });
  return {
    lifecycle: {
      onResponse({ response }) {
        const sessionId = response.getPayloadsByType(
          "media-collection:new-session"
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

createMediaCollection.namespace = "Media Collection";

createMediaCollection.configValidators = objectOf({
  mediaCollection: objectOf({
    channel: string()
      .nonEmpty()
      .required(),
    playerName: string()
      .nonEmpty()
      .required(),
    version: string().nonEmpty(),
    mainPingInterval: number()
      .minimum(10)
      .maximum(60)
      .default(10),
    adPingInterval: number()
      .minimum(10)
      .maximum(60)
      .default(10)
  })
});
export default createMediaCollection;
