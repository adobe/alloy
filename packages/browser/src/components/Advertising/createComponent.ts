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

import type { Event } from "@adobe/alloy-core/core/types.js";
import type { AdvertisingEventOptions } from "./types.js";

export default ({
  handleOnBeforeSendEvent,
  sendAdConversionHandler,
}: {
  handleOnBeforeSendEvent: (payload: {
    event: Event;
    advertising?: AdvertisingEventOptions;
  }) => Promise<void>;
  sendAdConversionHandler: () => Promise<unknown>;
}) => {
  return {
    lifecycle: {
      onComponentsRegistered() {
        // Fire-and-forget: don't return the promise so we don't block
        // the configure command from resolving while waiting for consent.
        sendAdConversionHandler();
      },
      onBeforeEvent: handleOnBeforeSendEvent,
    },
  };
};
