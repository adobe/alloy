/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { ClientFunction, t } from "testcafe";
import { v4 as uuidv4 } from "uuid";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import getBaseConfig from "../../helpers/getBaseConfig.js";
import {
  compose,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";

const networkLogger = createNetworkLogger();
const organizationId = "5BFE274A5F6980A50A495C08@AdobeOrg";
const dataStreamId = "ae47e1ea-7625-49b9-b69f-8ad372e46344";
const orgMainConfigMain = getBaseConfig(organizationId, dataStreamId);
const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title: "Test C13405889: Verify DOM action using the evaluateRulesets command",
  requestHooks: [networkLogger.edgeEndpointLogs],
  url: `${TEST_PAGE_URL}?test=C13348429`,
});

test.meta({
  ID: "C13405889",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const getIframeContainer = ClientFunction(() => {
  const element = document.querySelector("#alloy-messaging-container");
  return element ? element.innerHTML : "";
});
const getAepEdgeResponse = async (requestId) => {
  const requestBody = {
    events: [
      {
        query: {
          personalization: {
            surfaces: ["web://alloyio.com/functional-test/testPage.html"],
          },
        },
        xdm: {
          timestamp: new Date().toISOString(),
          implementationDetails: {},
        },
      },
    ],
  };
  const res = await fetch(
    `https://edge.adobedc.net/ee/or2/v1/interact?configId=${dataStreamId}&requestId=${requestId}`,
    {
      body: JSON.stringify(requestBody),
      method: "POST",
    },
  );
  return res.json();
};

test.skip("Test C13405889: Verify DOM action using the evaluateRulesets command", async () => {
  const realResponse = await getAepEdgeResponse(uuidv4());
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({});

  await alloy.applyResponse({
    renderDecisions: false,
    responseBody: realResponse,
  });
  await alloy.evaluateRulesets({
    renderDecisions: true,
    personalization: {
      decisionContext: {
        user: "alloy",
      },
    },
  });
  const containerElement = await getIframeContainer();
  await t.expect(containerElement).contains("alloy-content-iframe");
});
