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
import createFixture from "../../helpers/createFixture";
import flushPromiseChains from "../../helpers/flushPromiseChains";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain";
import { compose, consentPending } from "../../helpers/constants/configParts";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { CONSENT_IN } from "../../helpers/constants/consent";

const networkLogger = createNetworkLogger();

createFixture({
  title: "C2660 - Context data is captured before user consents.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2660",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getContextUrlFromRequest = request => {
  const parsedBody = JSON.parse(request.request.body);
  return parsedBody.events[0].xdm.web.webPageDetails.URL;
};

test("C2660 - Context data is captured before user consents.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(compose(orgMainConfigMain, consentPending));

  // send an event that will be queued
  const sendEventResponse = await alloy.sendEventAsync();
  await flushPromiseChains();

  // change something that will be collected by Context Component
  await t.eval(() => {
    window.location.hash = "foo";
  });

  // set consent to flush the events queue
  await alloy.setConsent(CONSENT_IN);
  await sendEventResponse.result;

  // send another event to make sure the foo hash is collected normally
  await alloy.sendEvent();

  // expect that context was captured at the right time
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);
  const requests = networkLogger.edgeEndpointLogs.requests;
  await t.expect(getContextUrlFromRequest(requests[0])).eql(TEST_PAGE_URL);
  await t
    .expect(getContextUrlFromRequest(requests[1]))
    .eql(`${TEST_PAGE_URL}#foo`);
});
