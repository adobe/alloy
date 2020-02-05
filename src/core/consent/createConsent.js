/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { createTaskQueue } from "../../utils";

export default ({
  lifecycle,
  createConsentRequestPayload,
  sendEdgeNetworkRequest,
  consentState,
  awaitConsent
}) => {
  const queue = createTaskQueue();
  const setConsent = consentByPurpose => {
    // This is due to a restriction in Audience Manager that once a user
    // has consented to no purposes (opted-out), consent can't be changed.
    // There are plans to change this in the future.
    if (
      !consentState.isPending() &&
      !consentState.hasConsentedToAllPurposes()
    ) {
      throw new Error(
        "The user previously declined consent, which cannot be changed."
      );
    }

    consentState.suspend();

    const payload = createConsentRequestPayload();
    return lifecycle
      .onBeforeConsentRequest({
        payload
      })
      .then(() => {
        payload.setConsentLevel(consentByPurpose);
        return sendEdgeNetworkRequest({
          payload,
          action: "privacy/set-consent"
        });
      })
      .then(() => {
        // Don't let response data disseminate beyond this
        // point unless necessary.
      });
  };

  return {
    awaitConsent,
    /**
     * Update the user's consent. Only to be called by the
     * Privacy component.
     * @param {Object} consentByPurpose An object where the key is
     * the purposes name and the value is a string indicating the consent
     * status for the purpose.
     */
    setConsent(consentByPurpose) {
      // By using this queue, we ensure that only one consent request goes out
      // at a time so that we don't run into a race condition.
      return queue.addTask(() => setConsent(consentByPurpose));
    },
    /**
     * Only to be called by the Privacy component when a consent request is
     * complete.
     */
    // The promise from sendEdgeNetworkRequest (see above) won't be resolved
    // until promises returned from components' lifecycle.onResponse methods
    // are resolved. In some cases, those promises won't be resolved until
    // consent is received, which means that they may be waiting for
    // consentState to be unsuspended. This is a chicken-and-egg problem.
    // The solution we've chosen is to have the privacy component's
    // lifecycle.onResponse notify consent of a consent response so that
    // the consent state can be unsuspended and sendEdgeNetworkRequest
    // can finish its process.
    consentRequestComplete: consentState.unsuspend,
    /**
     * Only to be called by the Privacy component when any request is complete.
     */
    // Consent cookies can change on any response and not just from responses
    // to a consent request, therefore we should update our consent state from
    // cookies on every response we receive.
    requestComplete: consentState.updateFromCookies
  };
};
