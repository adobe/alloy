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

const millisecondsPerHour = 60 * 60 * 1000;

const getControlObject = () => {
  return JSON.parse(cookie.get("adobeIdSyncControl") || "{}");
};

const setControlObject = obj => {
  cookie.set("adobeIdSyncControl", JSON.stringify(obj), {
    expires: 6 * 30 // 6 months
  });
};

export default ({ destinations, config, logger }) => {
  if (config.idSyncsEnabled === undefined || config.idSyncsEnabled) {
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
