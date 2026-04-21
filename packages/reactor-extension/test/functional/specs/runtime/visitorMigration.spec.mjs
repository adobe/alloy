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

import { t } from "testcafe";
import createNetworkLogger from "../../helpers/runtime/createNetworkLogger.mjs";
import appendLaunchLibrary from "../../helpers/runtime/appendLaunchLibrary.mjs";
import getReturnedEcid from "../../helpers/runtime/getReturnedEcid.mjs";
import { TEST_PAGE } from "../../helpers/runtime/constants/url.mjs";

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
          },
        ],
      },
    },
    "adobe-mcid": {
      displayName: "Mock Visitor",
      settings: {},
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
  environment: {
    id: "EN00000000000000000000000000000000",
    stage: "development",
  },
  buildInfo: {
    turbineVersion: "27.2.1",
    turbineBuildDate: "2022-04-29T16:01:37.616Z",
    buildDate: "2022-04-29T16:01:37.616Z",
    environment: "development",
  },
};

fixture("Visitor migration")
  .page(TEST_PAGE)
  .requestHooks([networkLogger.edgeEndpointLogs]);

// The mock visitor extension is different enough that this test doesn't work,
// but it does work in prod.
test.skip("waits for Visitor to be initialized before running", async () => {
  await appendLaunchLibrary(container);
  // The requestLogger.count method uses TestCafe's smart query
  // assertion mechanism, so it will wait for the request to be
  // made or a timeout is reached.
  await t.expect(networkLogger.edgeEndpointLogs.count(() => true)).eql(1);
  const ecid = getReturnedEcid(networkLogger.edgeEndpointLogs.requests[0]);
  // This is the ID returned from the mock visitor extension.
  await t.expect(ecid).eql("00781847927133700121980094732316198575");
});
