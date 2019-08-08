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
import { DAY, HOUR, MILLISECOND } from "../../utils/convertTimes";
import { COOKIE_NAMES } from "./constants";

const { ID_SYNC_TIMESTAMP, ID_SYNC_CONTROL } = COOKIE_NAMES;
const getControlObject = cookie => {
  const val = cookie.get(ID_SYNC_CONTROL) || "";
  const arr = val ? val.split("_") : [];

  return arr.reduce((controlObject, idTimestampPair) => {
    const [id, timestamp] = idTimestampPair.split("-");

    controlObject[id] = parseInt(timestamp, 36);

    return controlObject;
  }, {});
};

const setControlObject = (controlObject, cookie) => {
  const arr = Object.keys(controlObject).map(
    id => `${id}-${controlObject[id].toString(36)}`
  );

  cookie.set(ID_SYNC_CONTROL, arr.join("_"));
};

export default ({ destinations, config, logger, cookie }) => {
  if (!config.idSyncsEnabled) {
    return;
  }

  const controlObject = getControlObject(cookie);
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

  if (idSyncs.length) {
    fireDestinations({
      logger,
      destinations: idSyncs
    }).then(result => {
      const timeStamp = Math.round(
        convertTimes(MILLISECOND, HOUR, new Date().getTime())
      ); // hours

      result.succeeded.forEach(idSync => {
        const ttl = (idSync.ttl || 7) * 24; // hours

        if (idSync.id !== undefined) {
          controlObject[idSync.id] = timeStamp + ttl;
        }
      });

      setControlObject(controlObject, cookie);

      cookie.set(
        ID_SYNC_TIMESTAMP,
        (
          Math.round(convertTimes(MILLISECOND, HOUR, new Date().getTime())) +
          convertTimes(DAY, HOUR, 7)
        ).toString(36)
      );
    });
  }
};
