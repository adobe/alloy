import { ClientFunction, t } from "testcafe";
import fixtureFactory from "../helpers/fixtureFactory";
import { alloyWithVisitorTestPageUrl } from "../helpers/constants/testServerUrl";
import getVisitorEcid from "../helpers/visitorService/getVisitorEcid";
import createMockOptIn from "../helpers/optIn/createMockOptIn";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled,
  consentPending
} from "../helpers/constants/configParts";

fixtureFactory({
  title:
    "C35450 - When ID migration is enabled and Visitor and Alloy are both awaiting consent, when consent is given to both, Alloy waits for Visitor to get ECID and then uses this value.",
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
  migrationEnabled,
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

test("C35450 - When ID migration is enabled and Visitor and Alloy are both awaiting consent, when consent is given to both, Alloy waits for Visitor to get ECID and then uses this value.", async () => {
  await createMockOptIn(true);
  await configureAlloyInstance("alloy", config);
  await setConsent({ general: "in" });
  const visitorEcid = await getVisitorEcid(orgMainConfigMain.orgId);
  await t.expect(getAlloyEcid()).eql(visitorEcid);
});
