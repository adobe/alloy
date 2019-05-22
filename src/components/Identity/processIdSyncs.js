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

import { assign, cookie, fireDestinations } from "../../utils";
import namespace from "../../constants/namespace";

const millisecondsPerHour = 60 * 60 * 1000;

// TODO: use alloy cookie once https://github.com/adobe/alloy/pull/26 is merged
const getControlObject = () => {
  const val = cookie.get(`${namespace}idSyncControl`) || "";
  const arr = val ? val.split("_") : [];

  return arr.reduce((obj, pair) => {
    const o = obj;
    const [id, ts] = pair.split("-");

    o[id] = ts;

    return o;
  }, {});
};

const setControlObject = obj => {
  const arr = [];

  Object.keys(obj).forEach(id => arr.push(`${id}-${obj[id]}`));

  cookie.set(`${namespace}idSyncControl`, arr.join("_"), {
    expires: 6 * 30 // 6 months
  });
};

export default ({ destinations, config, logger }) => {
  if (config.idSyncsEnabled) {
    const controlObject = getControlObject();
    const now = new Date().getTime() / millisecondsPerHour; // hours

    Object.keys(controlObject).forEach(key => {
      if (controlObject[key] < now) {
        delete controlObject[key];
      }
    });

    const idSyncs = destinations
      .filter(
        dest => dest.type === "url" && controlObject[dest.id] === undefined
      )
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
          new Date().getTime() / millisecondsPerHour
        ); // hours

        result.succeeded.forEach(idSync => {
          const ttl = (idSync.ttl || 7) * 24; // hours

          if (idSync.id !== undefined) {
            controlObject[idSync.id] = timeStamp + ttl;
          }
        });

        setControlObject(controlObject);
      });
    }
  }
};
