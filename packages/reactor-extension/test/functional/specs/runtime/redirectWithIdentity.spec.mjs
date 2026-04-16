/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { t, ClientFunction, Selector } from "testcafe";
import createNetworkLogger from "../../helpers/runtime/createNetworkLogger.mjs";
import addHtmlToBody from "../../helpers/runtime/addHtmlToBody.mjs";
import {
  SECONDARY_TEST_PAGE,
  TEST_PAGE,
} from "../../helpers/runtime/constants/url.mjs";
import getReturnedEcid from "../../helpers/runtime/getReturnedEcid.mjs";
import appendLaunchLibrary from "../../helpers/runtime/appendLaunchLibrary.mjs";

const networkLogger = createNetworkLogger();

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
    {
      id: "RL1653692204047",
      name: "Append identity to urls",
      events: [
        {
          modulePath: "sandbox/click.js",
          settings: {},
        },
      ],
      actions: [
        {
          modulePath:
            "adobe-alloy/dist/lib/actions/redirectWithIdentity/index.js",
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
  environment: {
    id: "EN00000000000000000000000000000000",
    stage: "development",
  },
  buildInfo: {
    turbineVersion: "27.2.1",
    turbineBuildDate: "2022-05-27T22:57:44.929Z",
    buildDate: "2022-05-27T22:57:44.929Z",
    environment: "development",
  },
};

fixture("Redirect with identity")
  .page(TEST_PAGE)
  .requestHooks([networkLogger.edgeEndpointLogs]);

const getLocation = ClientFunction(() => document.location.href);

// Unfortunately, the sandbox click event is different from the core click event
// to the point where this fails.
test.skip("Redirects with an identity", async () => {
  await appendLaunchLibrary(container);

  await addHtmlToBody(
    `<a href="${SECONDARY_TEST_PAGE}"><div id="mylink">My link</div></a>`,
  );
  // The requestLogger.count method uses TestCafe's smart query
  // assertion mechanism, so it will wait for the request to be
  // made or a timeout is reached.
  await t.expect(networkLogger.edgeEndpointLogs.count(() => true)).eql(1);
  await t.click(Selector("#mylink"));
  await t.expect(getLocation()).contains(SECONDARY_TEST_PAGE);
  await appendLaunchLibrary(container);

  // Events are: page load, link click, page load.
  await t.expect(networkLogger.edgeEndpointLogs.count(() => true)).eql(3);
  const pageLoad1Ecid = getReturnedEcid(
    networkLogger.edgeEndpointLogs.requests[0],
  );
  const pageLoad2Ecid = getReturnedEcid(
    networkLogger.edgeEndpointLogs.requests[2],
  );
  await t.expect(pageLoad1Ecid).eql(pageLoad2Ecid);
});
