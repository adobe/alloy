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

import { RETRY_AFTER } from "../../constants/httpHeaderNames";
import { isInteger } from "../../utils";

// The retry gets incrementally (but not exponentially) longer for each retry.
const FIRST_DELAY_MILLIS = 1000;
const INCREMENTAL_DELAY_MILLIS = 1000;

// When the target delay is randomized, make it within the range of this percentage above or below the target delay.
const MAX_RANDOM_VARIANCE_PERCENTAGE = 0.3;

const calculateRetryDelay = retriesAttempted => {
  const targetDelay =
    FIRST_DELAY_MILLIS + retriesAttempted * INCREMENTAL_DELAY_MILLIS;
  const maxVariance = targetDelay * MAX_RANDOM_VARIANCE_PERCENTAGE;
  const minDelay = targetDelay - maxVariance;
  const maxDelay = targetDelay + maxVariance;
  const randomizedDelayWithinRange = Math.round(
    minDelay + Math.random() * (maxDelay - minDelay)
  );
  return randomizedDelayWithinRange;
};

const getDelayFromHeader = response => {
  // According to the HTTP spec, if the header is defined, its value will be a string that
  // represents either:
  //  * An integer indicating the number of seconds to delay.
  //  * A date after which a retry may occur. The date would be in HTTP-date
  //    format (https://tools.ietf.org/html/rfc7231#section-7.1.1.1). When debugging, it can
  //    be helpful to know that this is the same format that a JavaScript date's
  //    toGMTString() returns.
  const headerValue = response.getHeader(RETRY_AFTER);
  let delayInMillis;

  if (headerValue) {
    const headerValueInt = parseInt(headerValue, 10);
    if (isInteger(headerValueInt)) {
      delayInMillis = headerValueInt * 1000;
    } else {
      delayInMillis = Math.max(
        0,
        new Date(headerValue).getTime() - new Date().getTime()
      );
    }
  }

  return delayInMillis;
};

// These rules are in accordance with
// https://git.corp.adobe.com/pages/experience-edge/konductor/#/apis/errors?id=handling-4xx-and-5xx-responses
// For retry delays that don't come from a Retry-After response header, we try to stick with the following best
// practices outlined in https://docs.microsoft.com/en-us/azure/architecture/best-practices/transient-faults:
//  * Incremental retry
//  * Random interval
export default ({ response, retriesAttempted }) => {
  // Technically, only 429 or 503 responses should have a Retry-After header, but we'll respect the
  // header if we find it on any response.
  let delayInMillis = getDelayFromHeader(response);

  // Note that the value of delay may be 0 at this point, which would be a valid delay we want to use
  // and not override, which is why we don't do:
  // if (!delay) { ... }
  if (delayInMillis === undefined) {
    delayInMillis = calculateRetryDelay(retriesAttempted);
  }

  return delayInMillis;
};
