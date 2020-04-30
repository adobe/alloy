import { ClientFunction, t } from "testcafe";
import fixtureFactory from "../helpers/fixtureFactory";
import createMockVisitor from "../helpers/visitorService/createMockVisitor";
import createMockOptIn from "../helpers/optIn/createMockOptIn";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import generateId from "../helpers/generateId";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled,
  consentPending
} from "../helpers/constants/configParts";

fixtureFactory({
  title:
    "C36909 When ID migration is disabled and Visitor and Alloy are both awaiting consent, when Visitor is denied and Alloy is approved, Alloy goes ahead with getting an ECID."
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

const getEcid = ClientFunction(() => {
  return window.alloy("getIdentity", {}).then(result => {
    return result.ECID;
  });
});

test("C36909 When ID migration is disabled and Visitor and Alloy are both awaiting consent, when Visitor is denied and Alloy is approved, Alloy goes ahead with getting an ECID", async () => {
  const ecid = generateId();
  await createMockVisitor(ecid);
  await createMockOptIn(false);
  await configureAlloyInstance("alloy", config);
  await setConsent({ general: "in" });
  await t.expect(getEcid()).notEql(ecid);
});
