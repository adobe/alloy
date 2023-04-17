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
import createFixture from "../../helpers/createFixture";
import getVisitorEcid from "../../helpers/visitorService/getVisitorEcid";
import createMockOptIn from "../../helpers/optIn/createMockOptIn";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled,
  consentPending
} from "../../helpers/constants/configParts";
import { CONSENT_IN } from "../../helpers/constants/consent";
import createAlloyProxy from "../../helpers/createAlloyProxy";

createFixture({
  title:
    "C35450 - When ID migration is enabled and Visitor and Alloy are both awaiting consent, when consent is given to both, Alloy waits for Visitor to get ECID and then uses this value.",
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

test("C35450 - When ID migration is enabled and Visitor and Alloy are both awaiting consent, when consent is given to both, Alloy waits for Visitor to get ECID and then uses this value.", async () => {
  await createMockOptIn(true);
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_IN);
  // Don't await the visitor ECID before executing the getIdentity command.
  // This helps ensure that Alloy is actually waiting for Visitor.
  const visitorEcidPromise = getVisitorEcid(orgMainConfigMain.orgId);
  const identityResult = await alloy.getIdentity();
  const visitorEcid = await visitorEcidPromise;
  await t.expect(identityResult.identity).eql({ ECID: visitorEcid });
});
