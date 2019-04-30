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

import createPayload from "./createPayload";
import createResponse from "./createResponse";

const setMeta = (payload, config) => {
  // Append meta to the payload.
  payload.mergeMeta({
    enableStore: config.shouldStoreCollectedData,
    device: config.device || "UNKNOWN-DEVICE"
  });
};

const initalizePayload = (config, events, beforeHook) => {
  // Populate the request's body with payload, data and meta.
  const payload = createPayload();

  events.forEach(event => {
    payload.addEvent(event);
  });

  return beforeHook(payload).then(() => {
    setMeta(payload, config);
    return payload;
  });
};

// TODO: Extract this stuff into a core helper.
const callServer = (config, endpoint) => payload => {
  return fetch(
    `${config.collectionUrl}/${endpoint}?propertyID=${config.propertyID}`,
    {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      },
      referrer: "client",
      body: JSON.stringify(payload)
    }
  );
};

export default config => {
  return {
    send(events, endpoint, beforeHook, afterHook) {
      return initalizePayload(config, events, beforeHook)
        .then(callServer(config, endpoint))
        .then(response => response.json())
        .then(createResponse)
        .then(afterHook)
        .then(() => {}); // Makes sure the promise is resolved with no value.
    }
  };
};
