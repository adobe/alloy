import { ClientFunction, t } from "testcafe";
import createFixture from "../../helpers/createFixture";
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
import getVisitorEcid from "../../helpers/visitorService/getVisitorEcid";

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

const setConsent = ClientFunction(consent => {
  return window.alloy("setConsent", consent);
});

const getIdentity = ClientFunction(() => {
  return window.alloy("getIdentity");
});

test("C36908 When ID migration is enabled and Visitor and Alloy are both awaiting consent, when Visitor is denied and Alloy is approved, Alloy gets an ECID which is the same as Visitor's.", async () => {
  await createMockOptIn(false);

  await configureAlloyInstance("alloy", config);

  await setConsent(CONSENT_IN);
  const alloyIdentity = await getIdentity();
  await createMockOptIn(true);
  const visitorIdentity = await getVisitorEcid(orgMainConfigMain.orgId);

  await t.expect(alloyIdentity).eql({
    identity: {
      ECID: visitorIdentity
    }
  });
});
