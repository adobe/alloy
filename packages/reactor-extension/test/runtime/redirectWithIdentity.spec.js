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
import createEdgeMock, { ECID } from "./helpers/edgeMock.js";

const SECONDARY_TEST_PAGE =
  "https://alloyio2.com/functional-test/testPage.html";

const container = {
  extensions: {
    "adobe-alloy": {
      displayName: "Adobe Experience Platform Web SDK",
      settings: {
        instances: [
          {
            name: "alloy",
            edgeConfigId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83:AditiTest",
            thirdPartyCookiesEnabled: false,
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
    {
      id: "RL1653692204047",
      name: "Append identity to urls",
      events: [
        {
          modulePath: "sandbox/coreClick.js",
          settings: { elementSelector: "a[href]" },
        },
      ],
      actions: [
        {
          modulePath:
            "adobe-alloy/dist/lib/actions/redirectWithIdentity/index.js",
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
    orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
  },
};

describe("Redirect with identity", () => {
  let edge;

  beforeEach(() => {
    edge = createEdgeMock();
  });

  it("Redirects with an identity", async () => {
    // Navigating away would tear down the Vitest iframe, so capture the
    // redirect target instead of following it.
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    appendLaunchLibrary(container);
    document.body.insertAdjacentHTML(
      "beforeend",
      `<a href="${SECONDARY_TEST_PAGE}"><div id="mylink">My link</div></a>`,
    );
    await expect.poll(() => edge.requests.length).toBe(1);

    document.querySelector("#mylink").click();

    await expect.poll(() => open.mock.calls.length).toBe(1);
    const [location, target] = open.mock.calls[0];
    expect(target).toBe("_self");
    const url = new URL(location);
    expect(url.origin + url.pathname).toBe(SECONDARY_TEST_PAGE);
    expect(url.searchParams.get("adobe_mc")).toContain(`MCMID=${ECID}`);
    // ActivityCollector's own click listener reports the link click; wait for
    // it so it can't land after the mocks are reset.
    await expect.poll(() => edge.requests.length).toBe(2);
    expect(edge.requests[1].body.events[0].xdm.eventType).toBe(
      "web.webinteraction.linkClicks",
    );
  });
});
