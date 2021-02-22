import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import getVisitorEcid from "../../helpers/visitorService/getVisitorEcid";
import createMockOptIn from "../../helpers/optIn/createMockOptIn";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled,
  consentPending
} from "../../helpers/constants/configParts";
import { CONSENT_IN } from "../../helpers/constants/consent";
import createAlloyProxy from "../../helpers/createAlloyProxy";

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
