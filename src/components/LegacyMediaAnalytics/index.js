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

import createMediaEventManager from "../MediaCollection/createMediaEventManager";
import createMediaSessionCacheManager from "../MediaCollection/createMediaSessionCacheManager";
import createTrackMediaEvent from "../MediaCollection/createTrackMediaEvent";
import createTrackMediaSession from "../MediaCollection/createTrackMediaSession";
import createOnBeforeMediaEvent from "../MediaCollection/createOnBeforeMediaEvent";
import createLegacyMediaComponent from "./createLegacyMediaComponent";
import createMediaHelper from "./createMediaHelper";
import createGetInstance from "./createGetInstance";

const createLegacyMediaAnalytics = ({
  eventManager,
  sendEdgeNetworkRequest,
  config,
  logger,
  consent
}) => {
  const mediaSessionCacheManager = createMediaSessionCacheManager({ config });

  const mediaEventManager = createMediaEventManager({
    sendEdgeNetworkRequest,
    config,
    logger,
    consent,
    eventManager
  });

  const trackMediaEvent = createTrackMediaEvent({
    mediaSessionCacheManager,
    mediaEventManager,
    config
  });
  const trackMediaSession = createTrackMediaSession({
    config,
    logger,
    mediaEventManager,
    mediaSessionCacheManager,
    legacy: true
  });
  const onBeforeMediaEvent = createOnBeforeMediaEvent({
    mediaSessionCacheManager,
    logger,
    config,
    trackMediaEvent
  });

  return createLegacyMediaComponent({
    onBeforeMediaEvent,
    trackMediaSession,
    trackMediaEvent,
    createMediaHelper,
    createGetInstance,
    logger,
    config
  });
};

createLegacyMediaAnalytics.namespace = "Legacy Media Analytics";

export default createLegacyMediaAnalytics;