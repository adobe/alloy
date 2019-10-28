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

import { assign, fireDestinations, convertTimes } from "../../utils";
import { DAY, HOUR, MINUTE, MILLISECOND } from "../../utils/convertTimes";
import { ID_SYNC_TIMESTAMP, ID_SYNC_CONTROL } from "./constants/cookieNames";
import DEFAULT_ID_SYNC_TTL_MINUTES from "./constants/defaultIdSyncTtlMinutes";

const getControlObject = cookieJar => {
  const val = cookieJar.get(ID_SYNC_CONTROL) || "";
  const arr = val ? val.split("_") : [];

  return arr.reduce((controlObject, idTimestampPair) => {
    const [id, timestamp] = idTimestampPair.split("-");

    controlObject[id] = parseInt(timestamp, 36);

    return controlObject;
  }, {});
};

const setControlObject = (controlObject, cookieJar) => {
  const arr = Object.keys(controlObject).map(
    id => `${id}-${controlObject[id].toString(36)}`
  );

  cookieJar.set(ID_SYNC_CONTROL, arr.join("_"));
};

const createProcessor = (config, logger, cookieJar) => destinations => {
  if (!config.idSyncEnabled) {
    return Promise.reject(new Error("ID synchronization not enabled"));
  }

  const controlObject = getControlObject(cookieJar);
  const now = convertTimes(MILLISECOND, HOUR, new Date().getTime()); // hours

  Object.keys(controlObject).forEach(key => {
    if (controlObject[key] < now) {
      delete controlObject[key];
    }
  });

  const idSyncs = destinations
    .filter(dest => dest.type === "url" && controlObject[dest.id] === undefined)
    .map(dest =>
      assign(
        {
          id: dest.id
        },
        dest.spec
      )
    );

  return fireDestinations({
    logger,
    destinations: idSyncs
  }).then(result => {
    const nowInHours = Math.round(
      convertTimes(MILLISECOND, HOUR, new Date().getTime())
    );

    result.succeeded.forEach(idSync => {
      const ttlInHours = Math.round(
        convertTimes(
          MINUTE,
          HOUR,
          idSync.ttlMinutes || DEFAULT_ID_SYNC_TTL_MINUTES
        )
      );

      controlObject[idSync.id] = nowInHours + ttlInHours;
    });

    setControlObject(controlObject, cookieJar);

    cookieJar.set(
      ID_SYNC_TIMESTAMP,
      (
        Math.round(convertTimes(MILLISECOND, HOUR, new Date().getTime())) +
        convertTimes(DAY, HOUR, 7)
      ).toString(36)
    );

    if (result.failed.length) {
      const failedIds = result.failed.map(idSync => idSync.id);

      throw new Error(
        `The following ID sync IDs failed: ${failedIds.join(", ")}.`
      );
    }

    return result;
  });
};

const createExpiryChecker = cookieJar => () => {
  const nowInHours = Math.round(
    convertTimes(MILLISECOND, HOUR, new Date().getTime())
  );
  const timestamp = parseInt(cookieJar.get(ID_SYNC_TIMESTAMP) || 0, 36);

  return nowInHours > timestamp;
};

export default (config, logger, cookieJar) => {
  return {
    process: createProcessor(config, logger, cookieJar),
    hasExpired: createExpiryChecker(cookieJar)
  };
};
