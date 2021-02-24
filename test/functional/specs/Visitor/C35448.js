import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import getVisitorEcid from "../../helpers/visitorService/getVisitorEcid";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

createFixture({
  title:
    "C35448 - When ID migration is enabled and Visitor is on the page, Alloy waits for Visitor to get ECID and then uses this value.",
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
  migrationEnabled
);

test("C35448 - When ID migration is enabled and Visitor is on the page, Alloy waits for Visitor to get ECID and then uses this value.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  // Don't await the visitor ECID before executing the getIdentity command.
  // This helps ensure that Alloy is actually waiting for Visitor.
  const visitorEcidPromise = getVisitorEcid(orgMainConfigMain.orgId);
  const identityResult = await alloy.getIdentity();
  const visitorEcid = await visitorEcidPromise;
  await t.expect(identityResult).eql({
    identity: {
      ECID: visitorEcid
    },
    edge: {
      regionId: 9
    }
  });
});
