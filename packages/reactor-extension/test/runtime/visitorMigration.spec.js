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

import { beforeEach, describe, expect, it, vi } from "vitest";
import appendLaunchLibrary from "./helpers/appendLaunchLibrary.js";
import createEdgeMock from "./helpers/edgeMock.js";

const ORG_ID = "5BFE274A5F6980A50A495C08@AdobeOrg";
const LEGACY_ECID = "00781847927133700121980094732316198575";

const container = {
  extensions: {
    "adobe-alloy": {
      displayName: "Adobe Experience Platform Web SDK",
      settings: {
        instances: [
          {
            name: "alloy",
            edgeConfigId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83:AditiTest",
          },
        ],
      },
    },
  },
  rules: [
    {
      id: "RL1651248059877",
      name: "Page Top",
      events: [{ modulePath: "sandbox/pageTop.js", settings: {} }],
      actions: [
        {
          modulePath: "adobe-alloy/dist/lib/actions/sendEvent/index.js",
          settings: { instanceName: "alloy" },
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
    orgId: ORG_ID,
  },
};

// Alloy only reads window.Visitor.getInstance(orgId).getMarketingCloudVisitorID
// (browser createBrowserLegacyService), so a stub is enough.
const stubVisitor = () => {
  let release;
  const ready = new Promise((resolve) => {
    release = resolve;
  });
  let signalCallbackRegistered;
  const callbackRegistered = new Promise((resolve) => {
    signalCallbackRegistered = resolve;
  });
  const getMarketingCloudVisitorID = vi.fn((callback) => {
    signalCallbackRegistered();
    ready.then(() => callback(LEGACY_ECID));
  });
  const Visitor = {
    getInstance: vi.fn(() => ({ getMarketingCloudVisitorID })),
  };
  window.Visitor = Object.assign(() => {}, Visitor);
  return {
    getInstance: window.Visitor.getInstance,
    callbackRegistered,
    release,
  };
};

const getRequestEcid = ({ body }) => body.xdm?.identityMap?.ECID?.[0]?.id;

describe("Visitor migration", () => {
  let edge;

  beforeEach(() => {
    edge = createEdgeMock();
  });

  it("waits for Visitor to be initialized before running", async () => {
    const visitor = stubVisitor();
    try {
      appendLaunchLibrary(container);

      // Alloy is now blocked on Visitor's callback.
      await visitor.callbackRegistered;
      expect(visitor.getInstance).toHaveBeenCalledWith(ORG_ID, {});
      expect(edge.requests).toHaveLength(0);
    } finally {
      visitor.release();
    }

    await expect.poll(() => edge.requests.length).toBe(1);
    // The original spec asserted the ECID in the Edge response, which a mock
    // would trivially satisfy; the ECID from Visitor is asserted in the request.
    expect(getRequestEcid(edge.requests[0])).toBe(LEGACY_ECID);
  });

  it("uses the AMCV cookie without calling Visitor", async () => {
    const visitor = stubVisitor();
    document.cookie = `AMCV_${ORG_ID}=MCMID|${LEGACY_ECID}; path=/`;
    appendLaunchLibrary(container);

    await expect.poll(() => edge.requests.length).toBe(1);
    expect(getRequestEcid(edge.requests[0])).toBe(LEGACY_ECID);
    expect(visitor.getInstance).not.toHaveBeenCalled();
  });

  it("does not wait for Visitor when ID migration is disabled", async () => {
    const visitor = stubVisitor();
    const modified = structuredClone(container);
    modified.extensions[
      "adobe-alloy"
    ].settings.instances[0].idMigrationEnabled = false;
    appendLaunchLibrary(modified);

    await expect.poll(() => edge.requests.length).toBe(1);
    expect(getRequestEcid(edge.requests[0])).toBeUndefined();
    expect(visitor.getInstance).not.toHaveBeenCalled();
  });
});
