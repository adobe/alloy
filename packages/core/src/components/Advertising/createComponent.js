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
  getBrowser,
  consent,
}) => {
  const componentConfig = config.advertising;

  const sendAdConversionHandler = createSendAdConversion({
    eventManager,
    cookieManager,
    adConversionHandler,
    logger,
    componentConfig,
    getBrowser,
    consent,
  });

  return {
    lifecycle: {
      onComponentsRegistered() {
        // Fire-and-forget: don't return the promise so we don't block
        // the configure command from resolving while waiting for consent.
        sendAdConversionHandler();
      },
      onBeforeEvent: ({ event, advertising = {} }) => {
        const { state } = consent.current();
        if (state !== "in") {
          // Consent not yet granted — skip advertising ID resolution
          // but don't block the sendEvent call.
          return undefined;
        }
        return handleOnBeforeSendEvent({
          cookieManager,
          logger,
          event,
          componentConfig,
          advertising,
          getBrowser,
        });
      },
    },
  };
};
