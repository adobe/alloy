/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import hash from "./hash";
import { defer } from "../../utils";

export const DECLINED_CONSENT = "The user declined consent.";
export const DECLINED_CONSENT_ERROR_CODE = "declinedConsent";

const createDeclinedConsentError = () => {
  const error = new Error(DECLINED_CONSENT);
  error.code = DECLINED_CONSENT_ERROR_CODE;
  return error;
};

export default () => {
  let queue;
  let lastConsentHash;
  let handleAwaitConsent;

  const processQueuedAwaits = () => {
    if (queue) {
      // hold a copy of the queue because handling the old awaitConsent calls could
      // put the machine back into the suspended state.
      const oldQueue = queue;
      queue = undefined;
      oldQueue.forEach(({ deferred, event }) => {
        handleAwaitConsent({ deferred, event });
      });
    }
  };

  // In the suspended state, just queue the events until the outstanding request has returned.
  const awaitSuspended = ({ deferred, event }) => {
    queue.push({ deferred, event });
  };

  const createAwaitWithCheck = fn => ({ deferred, event }) => {
    const consentXdm = event && event.getConsent();
    if (consentXdm) {
      const newHash = hash(consentXdm);
      if (lastConsentHash !== newHash) {
        event.mergeMeta({ consentHash: newHash });
        // Move to the suspended state until the request returns and the cookie is re-read.
        handleAwaitConsent = awaitSuspended;
        queue = [];
        deferred.resolve();
        return;
      }
    }
    // if the consent is undefined or hasn't changed, do the default action for this state.
    fn({ deferred, event });
  };

  const awaitIn = createAwaitWithCheck(({ deferred }) => {
    deferred.resolve();
  });

  const awaitOut = createAwaitWithCheck(({ deferred }) => {
    deferred.reject(createDeclinedConsentError());
  });

  // Every time a request is returned, alloy re-reads the consent cookie, and
  // calls in or out with the current consent hash. This will get the state
  // machine out of the suspended state.
  return {
    in(consentHash) {
      lastConsentHash = consentHash;
      handleAwaitConsent = awaitIn;
      processQueuedAwaits();
    },
    out(consentHash) {
      lastConsentHash = consentHash;
      handleAwaitConsent = awaitOut;
      processQueuedAwaits();
    },
    suspend() {
      handleAwaitConsent = awaitSuspended;
      queue = [];
    },
    awaitConsent(event) {
      const deferred = defer();
      handleAwaitConsent({ deferred, event });
      return deferred.promise;
    }
  };
};
