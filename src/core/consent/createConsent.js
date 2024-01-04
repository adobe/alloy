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

import { defer } from "../../utils";

export default () => {
  const generalConsentStateDefer = defer();

  return {
    initializeConsent(generalConsentState) {
      generalConsentStateDefer.resolve(generalConsentState);
    },
    /**
     * Waits for consent to be resolved (i.e. read consent cookie or setConsent is called) and then resolves or rejects.
     *
     * @returns resolved promise if consent is IN, rejected promise if consent is OUT.
     */
    awaitConsent() {
      return generalConsentStateDefer.promise.then(generalConsentState =>
        generalConsentState.awaitConsent()
      );
    },
    /**
     * Run if consent is IN, but return immediately for anything else
     *
     * @returns resolved promise if consent is IN, rejected promise if consent is OUT or PENDING
     */
    withConsent() {
      return generalConsentStateDefer.promise.then(generalConsentState =>
        generalConsentState.withConsent()
      );
    }
  };
};
