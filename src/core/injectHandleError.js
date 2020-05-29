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

import { toError } from "../utils";
import { DECLINED_CONSENT_ERROR_CODE } from "./consent/createConsentStateMachine";

export default ({ errorPrefix, logger }) => (error, operation) => {
  // In the case of declined consent, we've opted to not reject the promise
  // returned to the customer, but instead resolve the promise with an
  // empty result object.
  if (error.code === DECLINED_CONSENT_ERROR_CODE) {
    logger.warn(
      `The ${operation} could not fully complete because the user declined consent.`
    );
    return {};
  }

  const err = toError(error);
  err.message = `${errorPrefix} ${err.message}`;
  throw err;
};
