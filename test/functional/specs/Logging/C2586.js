import createFixture from "../../helpers/createFixture";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

createFixture({
  title: "C2586: Toggle logging through the querystring parameter.",
  url: `${TEST_PAGE_URL}?alloy_debug=true`
});

test.meta({
  ID: "C2586",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C2586: Toggle logging through the querystring parameter.", async t => {
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  await alloy.getLibraryInfo();

  const { info } = await t.getBrowserConsoleMessages();
  await t.expect(info).match(/Executing getLibraryInfo command/);
});
