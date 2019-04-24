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

import createDestinations from "../../utils/createDestinations";
import { isObject, isNonEmptyString, cookie } from "../../utils";

export default ({ destinations, config, logger }) => {
  const urlDestinations = destinations.reduce((arr, dest) => {
    if (isObject(dest) && dest.type === "url" && isObject(dest.spec)) {
      arr.push({
        url: dest.spec.url,
        hideReferrer: dest.spec.hideReferrer
      });
    }

    return arr;
  }, []);

  if (
    urlDestinations.length &&
    (config.destinationsEnabled === undefined || config.destinationsEnabled)
  ) {
    const destsUtil = createDestinations({ logger });

    destsUtil.fire(urlDestinations);

    // TODO: Figure out if this can be used correctly
    // destsUtil.end();
  }

  const cookieDestinations = destinations.reduce((arr, dest) => {
    if (isObject(dest) && dest.type === "cookie" && isObject(dest.spec)) {
      arr.push({
        name: dest.spec.name,
        value: dest.spec.value,
        domain: dest.spec.domain,
        ttl: dest.spec.ttl
      });
    }

    return arr;
  }, []);

  cookieDestinations.forEach(dest => {
    if (isNonEmptyString(dest.name)) {
      cookie.set(dest.name, dest.value || "", {
        domain: dest.domain || "",
        expires: dest.ttl ? dest.ttl : 13 * 30
      });
    } else {
      logger.error("Cookie destination had an invalid or no name.");
    }
  });
};
