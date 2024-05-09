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
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import { responseStatus } from "../../helpers/assertions/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import environmentContextConfig from "../../helpers/constants/environmentContextConfig.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import flushPromiseChains from "../../helpers/flushPromiseChains.js";
import { CONSENT_IN } from "../../helpers/constants/consent.js";

const networkLogger = createNetworkLogger();

createFixture({
  title: "C2593: Event command sets consent to in.",
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C2593",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION",
});

test("Test C2593: Event command consents to all purposes", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure({
    defaultConsent: "pending",
    ...environmentContextConfig,
  });
  // try to send an event and verify that it is queued
  const sendEventResponse = await alloy.sendEventAsync();
  await flushPromiseChains();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);

  // set the consent to in
  await alloy.setConsent(CONSENT_IN);

  // ensure the event goes out
  await sendEventResponse.result;
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
});
