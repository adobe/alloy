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
      const oldQueue = queue;
      queue = undefined;
      oldQueue.forEach(({ deferred, event }) => {
        handleAwaitConsent({ deferred, event });
      });
    }
  };

  const awaitSuspended = ({ deferred, event }) => {
    queue.push({ deferred, event });
  };

  const createAwaitWithCheck = fn => ({ deferred, event }) => {
    const consentXdm = event && event.getConsent();
    if (consentXdm) {
      const newHash = hash(consentXdm);
      if (lastConsentHash !== newHash) {
        event.mergeMeta({ consentHash: newHash });
        handleAwaitConsent = awaitSuspended;
        queue = [];
        deferred.resolve();
        return;
      }
    }
    fn({ deferred, event });
  };

  const awaitIn = createAwaitWithCheck(({ deferred }) => {
    deferred.resolve();
  });

  const awaitOut = createAwaitWithCheck(({ deferred }) => {
    deferred.reject(createDeclinedConsentError());
  });

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
