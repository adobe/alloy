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

import createPayload from "../Core/createPayload";

function setMetadata(payload, core) {
  // MAYBE: Not sure how the cross components communication will happen yet.
  const identity = core.components.getByNamespace("Identity");

  // Append metadata to the payload.
  payload.appendToMetadata({
    ecid: identity.commands.getEcid() || null,
    enableStore: core.configs.shouldStoreCollectedData,
    device: core.configs.device || "UNKNOWN-DEVICE"
  });
}

function setContext(payload) {
  // Append Context data; basically data we can infer from the environment.
  // TODO: take this stuff out of here, and have some helper component do that.
  payload.appendToContext({
    env: {
      js_enabled: true,
      js_version: "1.8.5",
      cookies_enabled: true,
      browser_height: 900,
      screen_orientation: "landscape",
      webgl_renderer: "AMD Radeon Pro 460 OpenGL Engine"
    },
    view: {
      url: "www.test.com",
      referrer: "www.adobe.com"
    }
  });
}

const initalizePayload = (core, data, beforeHook) => {
  // Populate the request's body with payload, data and metadata.
  const payload = createPayload({ data });

  // TODO: Make those hook calls Async?
  beforeHook(payload);
  setContext(payload);
  setMetadata(payload, core);

  return Promise.resolve(payload.toJson());
};

// TODO: Extract this stuff into a core helper.
const callServer = (core, endpoint) => payload => {
  return fetch(`${core.configs.collectionUrl}/${endpoint}`, {
    method: "POST",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json"
    },
    referrer: "client",
    body: payload
  });
};

export default core => {
  return {
    send: (data, endpoint, beforeHook, afterHook) => {
      return (
        initalizePayload(core, data, beforeHook)
          .then(callServer(core, endpoint))
          // Freeze the response before handing it to all the components.
          .then(response => Object.freeze(response.json()))
          .then(afterHook)
          .then(() => {}) // Makes sure the promise is resolved with no value.
      );
    }
  };
};
