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
import createNetworkLogger from "../../../helpers/networkLogger/index.js";
import createFixture from "../../../helpers/createFixture/index.js";
import createResponse from "../../../helpers/createResponse.js";
import getResponseBody from "../../../helpers/networkLogger/getResponseBody.js";
import cookies from "../../../helpers/cookies.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
} from "../../../helpers/constants/configParts/index.js";
import { MAIN_CONSENT_COOKIE_NAME } from "../../../helpers/constants/cookies.js";
import createAlloyProxy from "../../../helpers/createAlloyProxy.js";
import { IAB_NO_PURPOSE_TEN } from "../../../helpers/constants/consent.js";

const config = compose(orgMainConfigMain, debugEnabled);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C224677: Call setConsent when purpose 10 is FALSE.",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeEndpointLogs,
  ],
});

test.meta({
  ID: "C224677",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION",
});

test("Test C224677: Call setConsent when purpose 10 is FALSE", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(IAB_NO_PURPOSE_TEN);

  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  const rawResponse = JSON.parse(
    getResponseBody(networkLogger.setConsentEndpointLogs.requests[0]),
  );

  const response = createResponse({ content: rawResponse });

  // 1. The set-consent response should contain the Consent cookie: { general: in }
  const consentCookieValue = await cookies.get(MAIN_CONSENT_COOKIE_NAME);

  await t.expect(consentCookieValue).ok("No consent cookie found.");
  await t.expect(consentCookieValue).eql("general=in");

  // 2. The ECID should exist in the response payload as well, if queried
  const identityHandle = response.getPayloadsByType("identity:result");
  const returnedNamespaces = identityHandle.map((i) => i.namespace.code);
  await t.expect(identityHandle.length).eql(1);
  await t.expect(returnedNamespaces).contains("ECID");

  // 3. Event calls going forward should remain opted in, even though AAM opts out consents with no purpose 10.
  await alloy.sendEvent();
  const rawEventResponse = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0]),
  );
  const eventResponse = createResponse({ content: rawEventResponse });

  // 4. No warning message regarding opt-out should be returned anymore
  const warningTypes = eventResponse.getWarnings().map((w) => w.type);
  await t
    .expect(warningTypes)
    .notContains("https://ns.adobe.com/aep/errors/EXEG-0301-200");

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await t
    .expect(
      networkLogger.edgeEndpointLogs.count(
        ({ response: { statusCode } }) =>
          statusCode === 200 || statusCode === 207,
      ),
    )
    .eql(1);
});
