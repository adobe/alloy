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

import createNetworkLogger from "../../helpers/runtime/createNetworkLogger.mjs";
import appendLaunchLibrary from "../../helpers/runtime/appendLaunchLibrary.mjs";
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
            debugEnabled: true,
          },
        ],
      },
    },
  },
  dataElements: {
    "XDM Object 1": {
      settings: {
        cacheId: "47ec6bcf-a41a-4dde-8883-88c18a867d70",
        sandbox: {
          name: "prod",
        },
        schema: {
          id: "https://ns.adobe.com/unifiedjsqeonly/schemas/75bc29dc603dbb5c8ba7c9f5be97b852a48772ccc69d0921",
          version: "1.1",
        },
      },
      cleanText: false,
      forceLowerCase: false,
      modulePath: "adobe-alloy/dist/lib/dataElements/variable/index.js",
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
          modulePath: "adobe-alloy/dist/lib/actions/updateVariable/index.js",
          settings: {
            dataElementCacheId: "47ec6bcf-a41a-4dde-8883-88c18a867d70",
            data: {
              device: {
                colorDepth: 42,
              },
            },
          },
        },
        {
          modulePath: "adobe-alloy/dist/lib/actions/sendEvent/index.js",
          settings: {
            instanceName: "alloy",
            xdm: "%XDM Object 1%",
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
    turbineBuildDate: "2022-10-28T21:23:47.138Z",
    buildDate: "2022-10-28T21:23:47.139Z",
    environment: "development",
  },
};

fixture("Update variable")
  .page(TEST_PAGE)
  .requestHooks([networkLogger.edgeEndpointLogs]);

test("Updates a variable", async (t) => {
  await appendLaunchLibrary(container);
  // The requestLogger.count method uses TestCafe's smart query
  // assertion mechanism, so it will wait for the request to be
  // made or a timeout is reached.
  await t.expect(networkLogger.edgeEndpointLogs.count(() => true)).eql(1);
  const requestBody = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body,
  );
  await t.expect(requestBody.events[0].xdm.device.colorDepth).eql(42);
});
