import { ClientFunction, t } from "testcafe";
import fixtureFactory from "../helpers/fixtureFactory";
import createMockVisitor from "../helpers/visitorService/createMockVisitor";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import generateId from "../helpers/generateId";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled
} from "../helpers/constants/configParts";

fixtureFactory({
  title:
    "C35448 - When ID migration is enabled and Visitor is on the page, Alloy waits for Visitor to get ECID and then uses this value."
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

const getEcid = ClientFunction(() => {
  return window.alloy("getEcid", {});
});

test("C35448 - When ID migration is enabled and Visitor is on the page, Alloy waits for Visitor to get ECID and then uses this value.", async () => {
  const ecid = generateId();
  await createMockVisitor(ecid);
  await configureAlloyInstance("alloy", config);
  await t.expect(getEcid()).eql(ecid);
});
