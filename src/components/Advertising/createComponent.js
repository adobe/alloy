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

import createSendAdConversion from "./handlers/sendAdConversion.js";
import handleOnBeforeSendEvent from "./handlers/onBeforeSendEventHandler.js";

export default ({
  logger,
  config,
  eventManager,
  cookieManager,
  adConversionHandler,
}) => {
  const componentConfig = config.advertising;

  // Shared state for onBeforeSendEvent hook
  const sharedState = {
    surferIdAppendedToAepEvent: false,
  };

  // Create the sendAdConversion handler with required dependencies
  const sendAdConversionHandler = createSendAdConversion({
    eventManager,
    cookieManager,
    adConversionHandler,
    logger,
    componentConfig,
  });

  return {
    lifecycle: {
      onComponentsRegistered() {
        sendAdConversionHandler();
      },
      onBeforeEvent: ({ event }) => {
        handleOnBeforeSendEvent({
          cookieManager,
          logger,
          state: sharedState,
          event,
          componentConfig,
        });
      },
    },
  };
};
