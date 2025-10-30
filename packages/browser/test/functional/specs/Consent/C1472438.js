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
import createFixture from "../../helpers/createFixture/index.js";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain.js";
import flushPromiseChains from "../../helpers/flushPromiseChains.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import { ADOBE2_OUT } from "../../helpers/constants/consent.js";

const networkLogger = createNetworkLogger();

createFixture({
  title: "C1472438: Adobe consent version 2.0 is translated to general=out",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeInteractEndpointLogs,
  ],
});

test.meta({
  ID: "C1472438",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION",
});

const configuration = {
  defaultConsent: "pending",
  ...orgMainConfigMain,
};

test("C1472438: Adobe consent version 2.0 is translated to general=out", async () => {
  // setup alloy
  const alloy = createAlloyProxy();
  await alloy.configure(configuration);

  // try to send an event, but it should be queued
  const sendEventResponse = await alloy.sendEventAsync();
  await flushPromiseChains();
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(0);

  // set the consent to OUT
  await alloy.setConsent(ADOBE2_OUT);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  // make sure the event does not go out
  await sendEventResponse.result;
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(0);
});
