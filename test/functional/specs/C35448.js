import { ClientFunction, t } from "testcafe";
import fixtureFactory from "../helpers/fixtureFactory";
import { alloyWithVisitorTestPageUrl } from "../helpers/constants/testServerUrl";
import getVisitorEcid from "../helpers/visitorService/getVisitorEcid";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled
} from "../helpers/constants/configParts";

fixtureFactory({
  title:
    "C35448 - When ID migration is enabled and Visitor is on the page, Alloy waits for Visitor to get ECID and then uses this value.",
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
  migrationEnabled
);

const getIdentity = ClientFunction(() => {
  return window.alloy("getIdentity");
});

test("C35448 - When ID migration is enabled and Visitor is on the page, Alloy waits for Visitor to get ECID and then uses this value.", async () => {
  await configureAlloyInstance("alloy", config);
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
