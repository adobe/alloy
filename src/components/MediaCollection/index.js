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

import createMediaSessionCacheManager from "./createMediaSessionCacheManager";
import createMediaEventManager from "./createMediaEventManager";
import createSendMediaEvent from "./createSendMediaEvent";
import configValidators from "./configValidators";
import createMediaComponent from "./createMediaComponent";

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

  const trackMediaEvent = createSendMediaEvent({
    mediaSessionCacheManager,
    mediaEventManager,
    config
  });

  return createMediaComponent({
    config,
    logger,
    trackMediaEvent,
    mediaEventManager,
    mediaSessionCacheManager
  });
};
createMediaCollection.namespace = "Media Collection";

createMediaCollection.configValidators = configValidators;
export default createMediaCollection;
