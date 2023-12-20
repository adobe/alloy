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

import { createMediaAnalyticsTracker } from "./createMediaAnalyticsTracker";
import createMediaEventManager from "../MediaCollection/createMediaEventManager";

const createLegacyMediaAnalytics = ({
  eventManager,
  sendEdgeNetworkRequest,
  config,
  logger,
  consent
}) => {
  const mediaEventManager = createMediaEventManager({
    sendEdgeNetworkRequest,
    config,
    logger,
    consent,
    eventManager
  });

  return {
    commands: {
      getMediaAnalyticsTracker: {
        run: () => {
          return createMediaAnalyticsTracker({
            config,
            logger,
            mediaEventManager
          });
        }
      }
    }
  };
};

createLegacyMediaAnalytics.namespace = "Legacy Media Analytics";

export default createLegacyMediaAnalytics;
