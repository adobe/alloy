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

const createSyncIdsByUrl = (
  config,
  logger,
  cookieJar,
  idSyncsProcessor
) => data => {
  const { idSyncs = [] } = data;
  const areAllIdSyncsValid = idSyncs.every((idSync = {}) => {
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
      return false;
    }

    return true;
  });

  if (!areAllIdSyncsValid) {
    return Promise.reject(
      new Error("syncIdsByUrl was passed one or more invalid id syncs.")
    );
  }

  return idSyncsProcessor.process(idSyncs);
};

export default (config, logger, cookieJar) => {
  const idSyncsProcessor = createIdSyncs(config, logger, cookieJar);

  return {
    syncIdsByUrl: createSyncIdsByUrl(
      config,
      logger,
      cookieJar,
      idSyncsProcessor
    )
  };
};
