/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { getSurferId } from "./collectSurferId.js";
import { getRampId } from "./collectRampId.js";
import { getID5Id } from "./collectID5Id.js";

const collectAllIdentities = (logger, componentConfig, cookieManager) => {
  const promises = {};
  const now = Date.now();
  const THROTTLE_WINDOW = 30 * 60 * 1000; // 30 minutes

  const isThrottled = (idType) => {
    const lastSuccessfulConversion = cookieManager.getValue(
      `${idType}_last_conversion`,
    );
    return (
      lastSuccessfulConversion &&
      now - lastSuccessfulConversion < THROTTLE_WINDOW
    );
  };

  if (!isThrottled("surferId")) {
    promises.surferId = getSurferId(cookieManager, true).catch(() => null);
  }

  if (
    componentConfig.id5Enabled &&
    componentConfig.id5PartnerId &&
    !isThrottled("id5Id")
  ) {
    promises.id5Id = getID5Id(logger, componentConfig.id5PartnerId).catch(
      () => null,
    );
  }

  if (
    componentConfig.rampIdEnabled &&
    componentConfig.rampIdScriptPath &&
    !isThrottled("rampId")
  ) {
    promises.rampId = getRampId(
      logger,
      componentConfig.rampIdScriptPath,
      cookieManager,
      true,
    ).catch(() => null);
  }

  return promises;
};

export default collectAllIdentities;
