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

import createIdSyncs from "./createIdSyncs";
import { isObject, isNumber, isNonEmptyString } from "../../utils";

const createSyncIdByUrl = (
  config,
  logger,
  cookieJar,
  idSyncsProcessor
) => data => {
  let hasInvalidIdSyncs = false;

  const idSyncs = (data.idSyncsArray || []).filter((idSync = {}) => {
    if (
      !isObject(idSync) ||
      idSync.type !== "url" ||
      !isNumber(idSync.id) ||
      !isObject(idSync.spec) ||
      !isNonEmptyString(idSync.spec.url) ||
      (idSync.spec.hideReferrer !== 0 && idSync.spec.hideReferrer !== 1) ||
      (idSync.spec.ttlMinutes !== undefined &&
        !isNumber(idSync.spec.ttlMinutes))
    ) {
      hasInvalidIdSyncs = true;

      return false;
    }

    return true;
  });

  if (hasInvalidIdSyncs) {
    logger.log(`[syncIdByUrl] was passed one or more invalid id syncs. The correct format is:
     {
        type: "url",
        id: 411,
        spec: {
          url:
            "https://idsync.com/365868.gif?partner_uid=79653899615727305204290942296930013268",
          hideReferrer: 0, // 0/1
          ttlMinutes: 120 // default = 10080 minutes = 7 days
        }
      }`);
  }

  if (idSyncs.length) {
    return idSyncsProcessor.process(idSyncs).then(result => {
      logger.log("[syncIdByUrl] processed successfully");

      return Promise.resolve(result);
    });
  }

  return Promise.resolve({
    message: "[syncIdByUrl] No ID syncs were in queue"
  });
};

export default (config, logger, cookieJar) => {
  const idSyncsProcessor = createIdSyncs(config, logger, cookieJar);

  return {
    syncIdByUrl: createSyncIdByUrl(config, logger, cookieJar, idSyncsProcessor)
  };
};
