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

import createAdConversionHandler from "./utils/createAdConversionHandler.js";
import validateAdConversionOptions from "./utils/validateAdConversionOptions.js";
import fetchAllIds from "./identities/fetchAllIds.js";

export default ({
  logger,
  config,
  eventManager,
  sendEdgeNetworkRequest,
  consent,
}) => {
  // Component configuration - ensure it works even without configuration
  const componentConfig = config?.advertising || {};
  logger.info("Advertising component initialized", componentConfig);

  // Store for advertising IDs
  let advertisingIds = {};

  const handleFetch = function () {
    return fetchAllIds()
      .then((ids) => {
        advertisingIds = ids;
        logger.info("Advertising IDs stored:", advertisingIds);
        return ids;
      })
      .catch((error) => {
        logger.error("Error fetching advertising IDs:", error);
        return {};
      });
  };

  // Create the specialized ad conversion handler
  const adConversionHandler = createAdConversionHandler({
    eventManager,
    sendEdgeNetworkRequest,
    consent,
    logger,
  });

  const sendAdConversion = async (options = {}) => {
    await handleFetch(); // Wait for advertisingIds to be populated

    // Create the event with standard structure
    const event = eventManager.createEvent();
    const advertisingXdm = {};

    if (options.clickThruEnabled) {
      if (advertisingIds.surfer_id) {
        advertisingXdm.skwcid = advertisingIds.surfer_id;
      }
    }

    if (options.viewThruEnabled) {
      // if (advertisingIds.liverampid) {
      //   advertisingXdm['liverampid'] = advertisingIds.liverampid;
      // }
    }

    // Set the event type and core data
    event.setUserXdm({
      advertising: advertisingXdm,
    });

    // Send the event using our specialized handler
    return adConversionHandler.trackAdConversion({ event });
  };

  return {
    lifecycle: {
      onComponentsRegistered() {
        logger.info("Advertising component registered");
        // Start fetching IDs when component is registered
        // Handle browser and non-browser environments
        if (typeof document !== "undefined") {
          //   if (document.readyState === "loading") {
          //     document.addEventListener("DOMContentLoaded", handleFetch);
          //   } else {
          //     handleFetch();
          //   }
        }
      },
    },
    commands: {
      sendAdConversion: {
        optionsValidator: (options) => validateAdConversionOptions({ options }),
        run: sendAdConversion,
      },
    },
  };
};
