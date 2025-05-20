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

import getAdvertisingIdentity from "../utils/getAdvertisingIdentity.js";

let inProgressPromise = null;
let advertisingIds = {};

const fetchAllIds = () => {
  if (inProgressPromise) {
    return inProgressPromise;
  }

  inProgressPromise = new Promise((resolve) => {
    const promises = [
      // todo: evaluate if we need to cache or not
      getAdvertisingIdentity().then((id) => ({ key: "surfer_id", value: id })),
      // fetchLiverampId().then(id => ({ key: 'liveramp_id', value: id })),
      // fetchId5().then(id => ({ key: 'id5_id', value: id })),
    ];

    Promise.allSettled(promises)
      .then((results) => {
        const finalIds = {};

        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value?.value) {
            finalIds[result.value.key] = result.value.value;
          } else if (result.status === "rejected") {
            console.warn(
              `Failed to fetch ${result.reason?.key || "an ID"}:`,
              result.reason,
            );
          }
        });

        advertisingIds = { ...advertisingIds, ...finalIds };
        console.log(
          "Advertising IDs fetched (partial or full):",
          advertisingIds,
        );
        resolve({ ...advertisingIds });
      })
      .finally(() => {
        inProgressPromise = null;
      });
  });

  return inProgressPromise;
};

export default fetchAllIds;
