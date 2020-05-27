import { ClientFunction, t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import { alloyWithVisitorTestPageUrl } from "../../helpers/constants/testServerUrl";
import getVisitorEcid from "../../helpers/visitorService/getVisitorEcid";
import createMockOptIn from "../../helpers/optIn/createMockOptIn";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled,
  consentPending
} from "../../helpers/constants/configParts";
import { CONSENT_IN } from "../../helpers/constants/consent";

createFixture({
  title:
    "C36909 When ID migration is disabled and Visitor and Alloy are both awaiting consent, when Visitor is denied and Alloy is approved, Alloy goes ahead with getting an ECID.",
  url: alloyWithVisitorTestPageUrl
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

const setConsent = ClientFunction(consent => {
  return window.alloy("setConsent", consent);
});

const getAlloyEcid = ClientFunction(() => {
  return window.alloy("getIdentity", {}).then(result => {
    return result.ECID;
  });
});

test("C36909 When ID migration is disabled and Visitor and Alloy are both awaiting consent, when Visitor is denied and Alloy is approved, Alloy goes ahead with getting an ECID", async () => {
  await createMockOptIn(false);
  await configureAlloyInstance("alloy", config);
  await setConsent(CONSENT_IN);
  const visitorEcid = await getVisitorEcid(orgMainConfigMain.orgId);
  await t.expect(getAlloyEcid()).notEql(visitorEcid);
});
