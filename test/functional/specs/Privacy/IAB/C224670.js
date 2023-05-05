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
import createNetworkLogger from "../../../helpers/networkLogger";
import { responseStatus } from "../../../helpers/assertions/index";
import createFixture from "../../../helpers/createFixture";
import createResponse from "../../../helpers/createResponse";
import getResponseBody from "../../../helpers/networkLogger/getResponseBody";
import cookies from "../../../helpers/cookies";
import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../../helpers/constants/configParts";
import { MAIN_CONSENT_COOKIE_NAME } from "../../../helpers/constants/cookies";
import createAlloyProxy from "../../../helpers/createAlloyProxy";
import { IAB_CONSENT_IN } from "../../../helpers/constants/consent";

const config = compose(orgMainConfigMain, consentPending, debugEnabled);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C224670: Opt in to IAB using the setConsent command.",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeEndpointLogs
  ]
});

test.meta({
  ID: "C224670",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

test("Test C224670: Opt in to IAB", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(IAB_CONSENT_IN);

  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  const consentRawResponse = JSON.parse(
    getResponseBody(networkLogger.setConsentEndpointLogs.requests[0])
  );

  const consentResponse = createResponse({ content: consentRawResponse });

  // 1. The set-consent response should contain the Consent cookie: { general: in }
  const consentCookieValue = await cookies.get(MAIN_CONSENT_COOKIE_NAME);

  await t.expect(consentCookieValue).ok("No consent cookie found.");
  await t.expect(consentCookieValue).eql("general=in");

  // 2. The ECID should exist in the response payload as well, if queried
  const identityHandle = consentResponse.getPayloadsByType("identity:result");
  const returnedNamespaces = identityHandle.map(i => i.namespace.code);
  await t.expect(identityHandle.length).eql(1);
  await t.expect(returnedNamespaces).contains("ECID");

  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
});
