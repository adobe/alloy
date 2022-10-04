import { ClientFunction, t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import getVisitorEcid from "../../helpers/visitorService/getVisitorEcid";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
// using require here so that the constant can be used in the clientFunction
const {
  default: REMOTE_VISITOR_LIBRARY_URL
} = require("../../helpers/constants/remoteVisitorLibraryUrl");

createFixture({
  title:
    "C35448 - When ID migration is enabled and Visitor is on the page, Alloy waits for Visitor to get ECID and then uses this value.",
  includeVisitorLibrary: false
});

test.meta({
  ID: "C35448",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const config = compose(orgMainConfigMain, debugEnabled, migrationEnabled);
const visitorReady = ClientFunction(() => {
  return window.Visitor !== undefined;
});
const injectVisitor = ClientFunction(
  () => {
    console.log(REMOTE_VISITOR_LIBRARY_URL);
    const s = document.createElement("script");
    s.src = REMOTE_VISITOR_LIBRARY_URL;
    document.body.appendChild(s);
  },
  { dependencies: { REMOTE_VISITOR_LIBRARY_URL } }
);

test("C35448 - When ID migration is enabled and Visitor is on the page, Alloy waits for Visitor to get ECID and then uses this value.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await injectVisitor();
  await t.expect(visitorReady()).ok();

  const identityResult = await alloy.getIdentity();
  const visitorEcid = await getVisitorEcid(orgMainConfigMain.orgId);
  await t.expect(identityResult.identity).eql({ ECID: visitorEcid });
});
