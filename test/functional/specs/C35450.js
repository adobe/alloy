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
  migrationEnabled,
  consentPending
} from "../helpers/constants/configParts";

fixtureFactory({
  title:
    "C35450 - When ID migration is enabled and Visitor and Alloy are both awaiting consent, when consent is given to both, Alloy waits for Visitor to get ECID and then uses this value."
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

const getEcid = ClientFunction(() => {
  return window.alloy("getIdentity", {}).then(result => {
    return Promise.resolve(result.ECID);
  });
});

test("C35450 - When ID migration is enabled and Visitor and Alloy are both awaiting consent, when consent is given to both, Alloy waits for Visitor to get ECID and then uses this value.", async () => {
  const ecid = generateId();
  await createMockVisitor(ecid);
  await createMockOptIn(true);
  await configureAlloyInstance("alloy", config);
  await setConsent({ general: "in" });
  await t.expect(getEcid()).eql(ecid);
});
