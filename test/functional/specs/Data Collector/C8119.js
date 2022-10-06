import { t, Selector } from "testcafe";
import createFixture from "../../helpers/createFixture";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody";
import {
  compose,
  orgMainConfigMain
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import preventLinkNavigation from "../../helpers/preventLinkNavigation";
import createCollectEndpointAsserter from "../../helpers/createCollectEndpointAsserter";

createFixture({
  title:
    "C8119: Does not send event with information about link clicks if disabled."
});

test.meta({
  ID: "C8119",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const addLinkToBody = () => {
  return addHtmlToBody(
    `<a id="alloy-link-test" href="blank.html">Test Link</a>`
  );
};

const clickLink = async () => {
  await t.click(Selector("#alloy-link-test"));
};

test("C8119: Load page with link. Click link. Verify no event sent.", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  await preventLinkNavigation();
  const alloy = createAlloyProxy();
  const testConfig = compose(orgMainConfigMain, {
    clickCollectionEnabled: false
  });
  await alloy.configure(testConfig);
  await addLinkToBody();
  await clickLink();
  await collectEndpointAsserter.assertNeitherCollectNorInteractCalled();
});
