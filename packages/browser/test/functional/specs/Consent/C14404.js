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

import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import { CONSENT_OUT, CONSENT_IN } from "../../helpers/constants/consent.js";
import cookies from "../../helpers/cookies.js";
import { MAIN_CONSENT_COOKIE_NAME } from "../../helpers/constants/cookies.js";

const config = compose(orgMainConfigMain, consentPending, debugEnabled);

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C14404: User cannot consent to all purposes after consenting to no purposes",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.setConsentEndpointLogs,
  ],
});

test.meta({
  ID: "C14404",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C14404: User can consent to all purposes after consenting to no purposes", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_OUT);

  // set consent back to in for the same user
  await alloy.setConsent(CONSENT_IN);

  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(2);

  const consentCookieValue = await cookies.get(MAIN_CONSENT_COOKIE_NAME);

  await t.expect(consentCookieValue).ok("No consent cookie found.");
  await t.expect(consentCookieValue).eql("general=in");

  // make sure event goes out
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
});
