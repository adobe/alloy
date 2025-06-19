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

/**
 * Handles onBeforeSendEvent to intercept AEP events and append surfer_id
 * @param {Object} params - All required parameters
 * @param {Object} params.sessionManager - Session manager for cookie operations
 * @param {Object} params.logger - Logger instance
 * @param {Object} params.state - Shared state object containing globalResolvedIds and surferIdAppendedToAepEvent
 * @param {Object} params.event - The event object from the hook
 */
export default function handleOnBeforeSendEvent({
  sessionManager,
  logger,
  state,
  event,
}) {
  try {
    // Check if surfer_id has been appended to any AEP event already
    if (!state.surferIdAppendedToAepEvent) {
      // Check if surfer_id exists in the consolidated advertising IDs cookie
      const fourDayCookieMaxAge = 4 * 24 * 60; // if surfer_id was set before 4 days, it will not be appended to the AEP event
      const surferIdFromCookie = sessionManager.getValue(
        "surfer_id",
        fourDayCookieMaxAge,
      );
      if (surferIdFromCookie) {
        logger.debug("Appending surfer_id to AEP event from cookie");

        const currentXdm = event.getContent()?.xdm || {};
        const updatedXdm = {
          ...currentXdm,
          advertising: {
            ...currentXdm.advertising,
            gSurferId: surferIdFromCookie,
          },
        };

        event.setUserXdm(updatedXdm);
        state.surferIdAppendedToAepEvent = true;

        logger.info(
          "Surfer ID appended to AEP event from cookie:",
          surferIdFromCookie,
        );
      }
    }
  } catch (error) {
    logger.error("Error in onBeforeSendEvent hook:", error);
  }
}
