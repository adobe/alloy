import Payload from "../Core/Payload";

function setMetadata(payload, core) {
  // MAYBE: Not sure how the cross components communication will happen yet.
  const identity = core.components.getComponent("Identity");

  // Append metadata to the payload.
  payload.appendToMetadata({
    ecid: identity.getEcid() || null,
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

export default function Request(core) {
  const createPayload = (data, beforeHook) => {
    // Populate the request's body with payload, data and metadata.
    const payload = new Payload({ data });

    // TODO: Make those hook calls Async?
    beforeHook(payload);
    setContext(payload);
    setMetadata(payload, core);

    return Promise.resolve(payload.toJson());
  };

  // TODO: Extract this stuff into a core helper.
  const callServer = endpoint => payload => {
    return fetch(core.configs.collectionUrl + "/" + endpoint, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      },
      referrer: "client",
      body: payload
    });
  };

  this.send = (data, endpoint, beforeHook, afterHook, callback) => {
    createPayload(data, beforeHook)
      .then(callServer(endpoint))
      // Freeze the response before handing it to all the components.
      .then(response => Object.freeze(response.json()))
      .then(afterHook)
      .then(() => callback("Request has been fired!"));
  };
}
