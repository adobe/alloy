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

import {
  createDataCollectionRequest,
  createDataCollectionRequestPayload,
} from "../../../utils/request/index.js";

/**
 * Creates a specialized handler for ad conversion events.
 * This follows a similar pattern to the media event handling in the StreamingMedia component.
 */
export default ({ sendEdgeNetworkRequest, consent, logger }) => {
  /**
   * Tracks an ad conversion event by sending it directly to the Edge Network
   */
  const trackAdConversion = ({ event }) => {
    // Use Alloy's standard request payload and request
    const dataCollectionRequestPayload = createDataCollectionRequestPayload();
    dataCollectionRequestPayload.addEvent(event);
    event.finalize();
    const request = createDataCollectionRequest({
      payload: dataCollectionRequestPayload,
    });

    logger.info("Sending ad conversion event to Edge Network");
    return consent.awaitConsent().then(() => {
      return sendEdgeNetworkRequest({ request })
        .then(() => {
          logger.info("Ad conversion event sent successfully");
          return { success: true };
        })
        .catch((error) => {
          logger.error("Failed to send ad conversion event", error);
          throw error;
        });
    });
  };

  return {
    trackAdConversion,
  };
};
