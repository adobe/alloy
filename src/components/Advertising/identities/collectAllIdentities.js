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

import collectSurferId from "./collectSurferId.js";
import { getRampId } from "./collectRampId.js";
import { getID5Id } from "./collectID5Id.js";
import { ID5_ID, RAMP_ID, SURFER_ID } from "../constants/index.js";
import { isThrottled } from "../utils/helpers.js";

const collectAllIdentities = (logger, componentConfig, cookieManager) => {
  const promises = {};

  if (!isThrottled(SURFER_ID, cookieManager)) {
    promises.surferId = collectSurferId(cookieManager, undefined, true).catch(
      () => null,
    );
  }

  if (componentConfig.id5PartnerId && !isThrottled(ID5_ID, cookieManager)) {
    promises.id5Id = getID5Id(logger, componentConfig.id5PartnerId).catch(
      () => null,
    );
  }

  if (componentConfig.rampIdJSPath && !isThrottled(RAMP_ID, cookieManager)) {
    promises.rampId = getRampId(
      logger,
      componentConfig.rampIdJSPath,
      cookieManager,
      true,
    ).catch(() => null);
  }

  return promises;
};

export default collectAllIdentities;
