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
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import { CONSENT_IN } from "../../helpers/constants/consent.js";

createFixture({
  title:
    'C14410: Setting consent for other purposes, or to other values than "in" or "out" should fail',
});

test.meta({
  ID: "C14410",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

// This test was originally designed to be done using one test case. When the configure command fails
// from the validation to make sure that only once instance has a particular orgId, the validation
// state isn't reset, so when I had this all in one test, the third part here was failing because
// an instance was already configured with that orgId.

test("Test C14410: Configuring default consent to 'unknown' fails", async (t) => {
  const alloy = createAlloyProxy();
  const errorMessage = await alloy.configureErrorMessage({
    defaultConsent: "unknown",
    ...orgMainConfigMain,
  });
  await t
    .expect(errorMessage)
    .ok("Expected the configure command to be rejected");
  await t.expect(errorMessage).contains("'defaultConsent':");
  await t
    .expect(errorMessage)
    .contains(
      `Expected one of these values: [["in","out","pending"]], but got "unknown"`,
    );
});

test("Test C14410: Setting consent for unknown purposes fails", async (t) => {
  const alloy = createAlloyProxy();
  await alloy.configure({
    defaultConsent: "pending",
    ...orgMainConfigMain,
  });
  const errorMessage = alloy.setConsentErrorMessage({
    consent: [
      { standard: "Adobe", version: "1.0", value: { analytics: "in" } },
    ],
  });
  await t
    .expect(errorMessage)
    .ok("Expected the setConsent command to be rejected");
  await t
    .expect(errorMessage)
    .contains("The server responded with a status code 400")
    .expect(errorMessage)
    .contains("EXEG-0102-400");

  // make sure we can call it again with the correct values
  await alloy.setConsent(CONSENT_IN);
});
