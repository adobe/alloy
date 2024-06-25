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
/* eslint-disable import/no-restricted-paths */

import createMediaEventManager from "../StreamingMedia/createMediaEventManager.js";
import createMediaSessionCacheManager from "../StreamingMedia/createMediaSessionCacheManager.js";
import createTrackMediaEvent from "../StreamingMedia/createTrackMediaEvent.js";
import createTrackMediaSession from "../StreamingMedia/createTrackMediaSession.js";
import createMediaResponseHandler from "../StreamingMedia/createMediaResponseHandler.js";
import createLegacyMediaComponent from "./createLegacyMediaComponent.js";
import createMediaHelper from "./createMediaHelper.js";
import createGetInstance from "./createGetInstance.js";
import injectTimestamp from "../Context/injectTimestamp.js";

const createLegacyMediaAnalytics = ({
  eventManager,
  sendEdgeNetworkRequest,
  config,
  logger,
  consent,
}) => {
  const mediaSessionCacheManager = createMediaSessionCacheManager({ config });

  const mediaEventManager = createMediaEventManager({
    sendEdgeNetworkRequest,
    config,
    consent,
    eventManager,
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
    legacy: true,
  });
  const mediaResponseHandler = createMediaResponseHandler({
    mediaSessionCacheManager,
    config,
    trackMediaEvent,
  });

  return createLegacyMediaComponent({
    mediaResponseHandler,
    trackMediaSession,
    trackMediaEvent,
    createMediaHelper,
    createGetInstance,
    logger,
    config,
  });
};

createLegacyMediaAnalytics.namespace = "Legacy Media Analytics";

export default createLegacyMediaAnalytics;
