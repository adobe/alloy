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
import createMediaSessionCacheManager from "./createMediaSessionCacheManager.js";
import createMediaEventManager from "./createMediaEventManager.js";
import createTrackMediaEvent from "./createTrackMediaEvent.js";
import configValidators from "./configValidators.js";
import createStreamingMediaComponent from "./createStreamingMediaComponent.js";
import createTrackMediaSession from "./createTrackMediaSession.js";
import createMediaResponseHandler from "./createMediaResponseHandler.js";
import injectTimestamp from "../Context/injectTimestamp.js";

const createStreamingMedia = ({
  config,
  logger,
  eventManager,
  sendEdgeNetworkRequest,
  consent,
}) => {
  const mediaSessionCacheManager = createMediaSessionCacheManager({ config });
  const mediaEventManager = createMediaEventManager({
    config,
    eventManager,
    logger,
    consent,
    sendEdgeNetworkRequest,
    setTimestamp: injectTimestamp(() => new Date()),
  });

  const trackMediaEvent = createTrackMediaEvent({
    mediaSessionCacheManager,
    mediaEventManager,
    config,
  });

  const trackMediaSession = createTrackMediaSession({
    config,
    mediaEventManager,
    mediaSessionCacheManager,
  });

  const mediaResponseHandler = createMediaResponseHandler({
    mediaSessionCacheManager,
    config,
    trackMediaEvent,
  });

  return createStreamingMediaComponent({
    config,
    trackMediaEvent,
    mediaEventManager,
    mediaResponseHandler,
    trackMediaSession,
  });
};
createStreamingMedia.namespace = "Streaming media";

createStreamingMedia.configValidators = configValidators;
export default createStreamingMedia;
