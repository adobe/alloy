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

const getAlloyEcid = ClientFunction(() => {
  return window.alloy("getIdentity", {}).then(result => {
    return result.ECID;
  });
});

test("C35448 - When ID migration is enabled and Visitor is on the page, Alloy waits for Visitor to get ECID and then uses this value.", async () => {
  await configureAlloyInstance("alloy", config);
  const visitorEcid = await getVisitorEcid(orgMainConfigMain.orgId);
  await t.expect(getAlloyEcid()).eql(visitorEcid);
});
