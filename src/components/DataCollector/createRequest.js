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

import createPayload from "../../core/createPayload";

function setMetadata(payload, config) {
  // Append metadata to the payload.
  payload.addMetadata({
    enableStore: config.shouldStoreCollectedData,
    device: config.device || "UNKNOWN-DEVICE"
  });
}

const initalizePayload = (config, event, beforeHook) => {
  // Populate the request's body with payload, data and metadata.
  const payload = createPayload({ events: [event] });

  return beforeHook(payload).then(() => {
    setMetadata(payload, config);
    return payload.toJson();
  });
};

// TODO: Extract this stuff into a core helper.
const callServer = (config, endpoint) => payload => {
  return fetch(`${config.collectionUrl}/${config.propertyId}/${endpoint}`, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    referrer: "client",
    body: payload
  });
};

export default config => {
  return {
    send: (events, endpoint, beforeHook, afterHook) => {
      return (
        initalizePayload(config, events, beforeHook)
          .then(callServer(config, endpoint))
          // Freeze the response before handing it to all the components.
          .then(response => Object.freeze(response.json()))
          .then(afterHook)
          .then(() => {}) // Makes sure the promise is resolved with no value.
      );
    }
  };
};
