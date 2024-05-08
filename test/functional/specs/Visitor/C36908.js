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
import createMockOptIn from "../../helpers/optIn/createMockOptIn.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled,
  consentPending
} from "../../helpers/constants/configParts/index.js";
import { CONSENT_IN } from "../../helpers/constants/consent.js";
import getVisitorEcid from "../../helpers/visitorService/getVisitorEcid.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

createFixture({
  title:
    "C36908 When ID migration is enabled and Visitor and Alloy are both awaiting consent, when Visitor is denied and Alloy is approved, Alloy gets an ECID which is the same as Visitor's.",
  includeVisitorLibrary: true
});

test.meta({
  ID: "C35448",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const config = compose(
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled,
  consentPending
);

test("C36908 When ID migration is enabled and Visitor and Alloy are both awaiting consent, when Visitor is denied and Alloy is approved, Alloy gets an ECID which is the same as Visitor's.", async () => {
  await createMockOptIn(false);

  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await alloy.setConsent(CONSENT_IN);
  const alloyIdentity = await alloy.getIdentity();
  await createMockOptIn(true);
  const visitorIdentity = await getVisitorEcid(orgMainConfigMain.orgId);

  await t.expect(alloyIdentity.identity).eql({ ECID: visitorIdentity });
});
