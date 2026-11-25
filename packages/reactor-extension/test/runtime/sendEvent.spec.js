/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { beforeEach, describe, expect, it } from "vitest";
import appendLaunchLibrary from "./helpers/appendLaunchLibrary.js";
import createEdgeMock from "./helpers/edgeMock.js";

const container = {
  extensions: {
    "adobe-alloy": {
      displayName: "Adobe Experience Platform Web SDK",
      settings: {
        debugEnabled: true,
        instances: [
          {
            name: "alloy",
            edgeConfigId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83:AditiTest",
            stagingEdgeConfigId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83:stage",
            debugEnabled: true,
          },
        ],
      },
    },
  },
  dataElements: {
    idmap: {
      settings: {
        AdCloud: [
          {
            id: "1234",
            authenticatedState: "ambiguous",
            primary: false,
          },
        ],
      },
      cleanText: false,
      forceLowerCase: false,
      modulePath: "adobe-alloy/dist/lib/dataElements/identityMap/index.js",
      storageDuration: "",
    },
  },
  rules: [
    {
      id: "RL1651248059877",
      name: "Page Top",
      events: [
        {
          modulePath: "sandbox/pageTop.js",
          settings: {},
        },
      ],
      actions: [
        {
          modulePath: "adobe-alloy/dist/lib/actions/sendEvent/index.js",
          settings: {
            instanceName: "alloy",
          },
        },
      ],
    },
  ],
  property: {
    name: "Sandbox property",
    settings: {
      id: "PR12345",
      domains: ["adobe.com", "example.com"],
      undefinedVarsReturnEmpty: false,
    },
  },
  company: {
    orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
  },
};

const EDGE_CONFIG_ID =
  container.extensions["adobe-alloy"].settings.instances[0].edgeConfigId;

const withInstanceSettings = (settings) => {
  const modified = structuredClone(container);
  Object.assign(
    modified.extensions["adobe-alloy"].settings.instances[0],
    settings,
  );
  return modified;
};

const withDataElementOverrides = (developmentOverrides, dataElementValue) => {
  const modified = withInstanceSettings({
    edgeConfigOverrides: {
      development: { enabled: true, ...developmentOverrides },
    },
  });
  modified.dataElements.overrideValue = {
    settings: { path: "overrideValue" },
    cleanText: false,
    defaultValue: dataElementValue,
    forceLowerCase: false,
    modulePath: "sandbox/javascriptVariable.js",
    storageDuration: "",
  };
  return modified;
};

// A property token that is not driven by a data element. It must reach the
// request in every override test, so an "absent" assertion on the data-element
// driven override can't pass just because all overrides were dropped.
const COMPANION_OVERRIDE = {
  com_adobe_target: { propertyToken: "companion-property-token" },
};

const waitForSingleRequest = async (edge) => {
  await expect.poll(() => edge.requests.length).toBe(1);
  const [request] = edge.requests;
  expect(request.url.searchParams.get("configId")).toBe(EDGE_CONFIG_ID);
  return request;
};

describe("Send event", () => {
  let edge;

  beforeEach(() => {
    edge = createEdgeMock();
  });

  it("Sends an event", async () => {
    appendLaunchLibrary(container);
    const { url } = await waitForSingleRequest(edge);
    expect(url.pathname).toMatch(/\/v1\/interact$/);
  });

  it("Sends the device time as xdm.timestamp by default", async () => {
    appendLaunchLibrary(container);
    const { body } = await waitForSingleRequest(edge);
    expect(typeof body.events[0].xdm.timestamp).toBe("string");
  });

  it("Leaves xdm.timestamp out when the server-side timestamp context is checked", async () => {
    appendLaunchLibrary(
      withInstanceSettings({
        context: [
          "web",
          "device",
          "environment",
          "placeContext",
          "serverSideTimestamp",
        ],
      }),
    );
    const { body } = await waitForSingleRequest(edge);
    expect(body.events[0].xdm.web).toBeTruthy();
    expect("timestamp" in body.events[0].xdm).toBe(false);
  });

  // Alloy sends overrides under meta.configOverrides; the TestCafe specs read
  // meta.com_adobe_identity, a path that is always undefined.
  it("Sends an event with empty strings as data element in the config overrides", async () => {
    appendLaunchLibrary(
      withDataElementOverrides(
        {
          ...COMPANION_OVERRIDE,
          com_adobe_identity: { idSyncContainerId: "%overrideValue%" },
        },
        "",
      ),
    );
    const { body } = await waitForSingleRequest(edge);
    expect(body.meta.configOverrides).toEqual(COMPANION_OVERRIDE);
  });

  it("Sends a numeric data element value in the config overrides", async () => {
    appendLaunchLibrary(
      withDataElementOverrides(
        {
          ...COMPANION_OVERRIDE,
          com_adobe_identity: { idSyncContainerId: "%overrideValue%" },
        },
        1234,
      ),
    );
    const { body } = await waitForSingleRequest(edge);
    expect(body.meta.configOverrides).toEqual({
      ...COMPANION_OVERRIDE,
      com_adobe_identity: { idSyncContainerId: 1234 },
    });
  });

  it("Sends an event with a data element to enable/disable a service via overrides", async () => {
    appendLaunchLibrary(
      withDataElementOverrides(
        {
          ...COMPANION_OVERRIDE,
          com_adobe_identity: { enabled: "%overrideValue%" },
        },
        true,
      ),
    );
    const { body } = await waitForSingleRequest(edge);
    // "true" is the default, so it must be deleted from the request. The
    // TestCafe spec also checked the Edge response body; a mocked response
    // would make that trivially true, so it is not asserted here.
    expect(body.meta.configOverrides).toEqual(COMPANION_OVERRIDE);
  });

  it("Sends false when the data element disables a service via overrides", async () => {
    appendLaunchLibrary(
      withDataElementOverrides(
        {
          ...COMPANION_OVERRIDE,
          com_adobe_identity: { enabled: "%overrideValue%" },
        },
        false,
      ),
    );
    const { body } = await waitForSingleRequest(edge);
    expect(body.meta.configOverrides).toEqual({
      ...COMPANION_OVERRIDE,
      com_adobe_identity: { enabled: false },
    });
  });
});
