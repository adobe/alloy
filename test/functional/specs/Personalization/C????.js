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
import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { createAssuranceRequestHook } from "../../helpers/assurance";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title: "C???? assurance example",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C????",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C???? assurance example", async () => {
  const assuranceRequests = await createAssuranceRequestHook();
  await t.addRequestHooks(assuranceRequests);

  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({
    renderDecisions: true,
    decisionScopes: ["alloy-test-scope-1"]
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  const mappingLog = await assuranceRequests.requests[0].find(log => {
    const { vendor, payload: { name } = {} } = log;
    return vendor === "com.adobe.analytics" && name === "analytics.mapping";
  });
  await t
    .expect(
      mappingLog.payload.context.mappedQueryParams.unifiedjsqeonlylatest.g
    )
    .eql("https://alloyio.com/functional-test/testPage.html");

  // you can run this to see all the logs instead of the find above
  // await new Promise(resolve => setTimeout(resolve, 5000));
  // await assuranceRequests.fetchMore();
  // assuranceRequests.requests[0].debug();
});
