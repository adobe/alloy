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
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  consentPending
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import { CONSENT_OUT } from "../../helpers/constants/consent.js";
import { MAIN_CONSENT_COOKIE_NAME } from "../../helpers/constants/cookies.js";
import cookies from "../../helpers/cookies.js";
import reloadPage from "../../helpers/reloadPage.js";

const config = compose(orgMainConfigMain, consentPending);

createFixture({
  title: "C14411: User consents to no purposes after consenting to no purposes"
});

test.meta({
  ID: "C14411",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14411: User consents to no purposes after consenting to no purposes with cache", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_OUT);
  // make sure this doesn't throw an error
  await alloy.setConsent(CONSENT_OUT);
});

test("Test C14411: User consents to no purposes after consenting to no purposes without cache", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_OUT);

  await reloadPage();
  await cookies.remove(MAIN_CONSENT_COOKIE_NAME);

  await alloy.configure(config);
  // make sure this doesn't throw an error
  await alloy.setConsent(CONSENT_OUT);
});
