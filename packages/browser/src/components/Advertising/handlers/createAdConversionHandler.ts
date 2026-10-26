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

import type { Event, Logger } from "@adobe/alloy-core/core/types.js";
import type { ConsentManager } from "@adobe/alloy-core/core/consent/types.js";
import type { EdgeRequestExecutor } from "@adobe/alloy-core/core/edgeNetwork/types.js";
import type * as request from "@adobe/alloy-core/utils/request";
import type { AdConversionHandler } from "../types.js";

/**
 * Creates a specialized handler for ad conversion events.
 * This follows a similar pattern to the media event handling in the StreamingMedia component.
 */
export default ({
  sendEdgeNetworkRequest,
  consent,
  createDataCollectionRequest,
  createDataCollectionRequestPayload,
  logger,
}: {
  eventManager?: unknown;
  sendEdgeNetworkRequest: EdgeRequestExecutor;
  consent: ConsentManager;
  createDataCollectionRequest: typeof request.createDataCollectionRequest;
  createDataCollectionRequestPayload: typeof request.createDataCollectionRequestPayload;
  logger: Logger;
}): AdConversionHandler => {
  /**
   * Tracks an ad conversion event by sending it directly to the Edge Network
   */
  const trackAdConversion = ({ event }: { event: Event }) => {
    const dataCollectionRequestPayload = createDataCollectionRequestPayload();
    dataCollectionRequestPayload.addEvent(event);
    event.finalize();
    const request = createDataCollectionRequest({
      payload: dataCollectionRequestPayload,
    });

    return consent.awaitConsent().then(() => {
      return sendEdgeNetworkRequest({ request })
        .then(() => {
          return { success: true };
        })
        .catch((error: unknown) => {
          logger.error("Failed to send ad conversion event", error);
          throw error;
        });
    });
  };

  return {
    trackAdConversion,
  };
};
