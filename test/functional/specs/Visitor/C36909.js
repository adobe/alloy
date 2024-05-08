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
import getVisitorEcid from "../../helpers/visitorService/getVisitorEcid.js";
import createMockOptIn from "../../helpers/optIn/createMockOptIn.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled,
  consentPending
} from "../../helpers/constants/configParts/index.js";
import { CONSENT_IN } from "../../helpers/constants/consent.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

createFixture({
  title:
    "C36909 When ID migration is disabled and Visitor and Alloy are both awaiting consent, when Visitor is denied and Alloy is approved, Alloy goes ahead with getting an ECID.",
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
  migrationDisabled,
  consentPending
);

test("C36909 When ID migration is disabled and Visitor and Alloy are both awaiting consent, when Visitor is denied and Alloy is approved, Alloy goes ahead with getting an ECID", async () => {
  await createMockOptIn(false);
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_IN);
  const visitorEcid = await getVisitorEcid(orgMainConfigMain.orgId);
  const alloyEcid = await alloy.getIdentity({});
  await t.expect(alloyEcid.identity.ECID).notEql(visitorEcid);
});
