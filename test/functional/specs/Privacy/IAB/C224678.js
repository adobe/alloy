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
import { responseStatus } from "../../../helpers/assertions/index.js";
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

const config = compose(orgMainConfigMain, debugEnabled);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C224678: Passing a negative Consent in the sendEvent command.",
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "C224678",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION",
});

// Consent with no Purpose 1, should result in Opt-Out.
const sendEventOptions = {
  xdm: {
    consentStrings: [
      {
        consentStandard: "IAB TCF",
        consentStandardVersion: "2.0",
        consentStringValue: "CO052oTO052oTDGAMBFRACBgAABAAAAAAIYgEawAQEagAAAA",
        gdprApplies: true,
        containsPersonalData: false,
      },
    ],
  },
};

test("Test C224678: Passing a negative Consent in the sendEvent command", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const errorMessage = await alloy.sendEventErrorMessage(sendEventOptions);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);

  const rawResponse = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0]),
  );

  const response = createResponse({ content: rawResponse });

  // 1. The set-consent response should contain the Consent cookie: { general: out }
  const consentCookieValue = await cookies.get(MAIN_CONSENT_COOKIE_NAME);

  await t.expect(consentCookieValue).ok("No consent cookie found.");
  await t.expect(consentCookieValue).eql("general=out");

  // 2. The ECID should exist in the response payload as well, even if queried
  const identityHandle = response.getPayloadsByType("identity:result");
  await t.expect(identityHandle.length).eql(1);

  // 3. Should not have any activation, ID Syncs or decisions in the response.
  const handlesThatShouldBeMissing = [
    "activation:push",
    "identity:exchange",
    "personalization:decisions",
  ].reduce((handles, handleType) => {
    const handle = response.getPayloadsByType(handleType);
    if (handle.length) {
      handles.push(handle);
    }
    return handles;
  }, []);

  await t.expect(handlesThatShouldBeMissing.length).eql(0);

  // 4. The server doesn't throw error messages when there is no consent
  await t
    .expect(errorMessage)
    .notOk("Event returned an error when we expected it not to.");

  // 5. But returns a warning message confirming the opt-out
  const warningTypes = response.getWarnings().map((w) => w.type);
  await t
    .expect(warningTypes)
    .contains("https://ns.adobe.com/aep/errors/EXEG-0301-200");

  // 6. Events should be blocked going forward because we are opted out.
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
});
