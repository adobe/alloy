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
import getResponseBody from "../../helpers/runtime/getResponseBody.mjs";
import { TEST_PAGE } from "../../helpers/runtime/constants/url.mjs";

const networkLogger = createNetworkLogger();

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

fixture("Send event")
  .page(TEST_PAGE)
  .requestHooks([networkLogger.edgeEndpointLogs]);

test("Sends an event", async () => {
  await appendLaunchLibrary(container);
  // The requestLogger.count method uses TestCafe's smart query
  // assertion mechanism, so it will wait for the request to be
  // made or a timeout is reached.
  await t.expect(networkLogger.edgeEndpointLogs.count(() => true)).eql(1);
});

test("Sends an event with empty strings as data element in the config overrides", async () => {
  const containerWithConfigOverrides = structuredClone(container);
  containerWithConfigOverrides.extensions[
    "adobe-alloy"
  ].settings.instances[0].edgeConfigOverrides = {
    development: {
      enabled: true,
      com_adobe_identity: {
        idSyncContainerId: "%emptyString%",
      },
    },
  };
  containerWithConfigOverrides.dataElements.emptyString = {
    settings: {
      path: "emptyString",
    },
    cleanText: false,
    defaultValue: "",
    forceLowerCase: false,
    modulePath: "sandbox/javascriptVariable.js",
    storageDuration: "",
  };
  await appendLaunchLibrary(containerWithConfigOverrides);
  // The requestLogger.count method uses TestCafe's smart query
  // assertion mechanism, so it will wait for the request to be
  // made or a timeout is reached.
  await t.expect(networkLogger.edgeEndpointLogs.count(() => true)).eql(1);
  const [request] = networkLogger.edgeEndpointLogs.requests;
  const body = JSON.parse(request.request.body);
  await t
    .expect(body.meta?.com_adobe_identity?.idSyncContainerId)
    .eql(undefined);
});

test("Sends an event with a data element to enable/disable a service via overrides", async () => {
  const containerWithConfigOverrides = structuredClone(container);
  containerWithConfigOverrides.extensions[
    "adobe-alloy"
  ].settings.instances[0].edgeConfigOverrides = {
    development: {
      enabled: true,
      com_adobe_identity: {
        enabled: "%enableIdentity%",
      },
    },
  };
  containerWithConfigOverrides.dataElements.enableIdentity = {
    settings: {
      path: "enableIdentity",
    },
    cleanText: false,
    defaultValue: true,
    forceLowerCase: false,
    modulePath: "sandbox/javascriptVariable.js",
    storageDuration: "",
  };
  await appendLaunchLibrary(containerWithConfigOverrides);
  // The requestLogger.count method uses TestCafe's smart query
  // assertion mechanism, so it will wait for the request to be
  // made or a timeout is reached.
  await t.expect(networkLogger.edgeEndpointLogs.count(() => true)).eql(1);
  const [request] = networkLogger.edgeEndpointLogs.requests;
  await t.expect(request.response.statusCode).eql(200);
  // "true" should be deleted from the response body
  const requestBody = JSON.parse(request.request.body);
  await t.expect(requestBody.meta?.com_adobe_identity?.enabled).eql(undefined);
  const body = JSON.parse(getResponseBody(request));
  await t.expect(body.meta?.com_adobe_identity?.enabled).eql(undefined);
});
