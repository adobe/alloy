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
  migrationEnabled,
  consentPending
} from "../../helpers/constants/configParts";
import { CONSENT_IN } from "../../helpers/constants/consent";

createFixture({
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

const getIdentity = ClientFunction(() => {
  return window.alloy("getIdentity");
});

test("C35450 - When ID migration is enabled and Visitor and Alloy are both awaiting consent, when consent is given to both, Alloy waits for Visitor to get ECID and then uses this value.", async () => {
  await createMockOptIn(true);
  await configureAlloyInstance("alloy", config);
  await setConsent(CONSENT_IN);
  // Don't await the visitor ECID before executing the getIdentity command.
  // This helps ensure that Alloy is actually waiting for Visitor.
  const visitorEcidPromise = getVisitorEcid(orgMainConfigMain.orgId);
  const identityResult = await getIdentity();
  const visitorEcid = await visitorEcidPromise;
  await t.expect(identityResult).eql({
    identity: {
      ECID: visitorEcid
    }
  });
});
