import { t, Selector, RequestLogger } from "testcafe";
import testServerUrl from "../../helpers/constants/testServerUrl";
import fixtureFactory from "../../helpers/fixtureFactory";
import baseConfig from "../../helpers/constants/baseConfig";
import addAnchorToBody from "../../helpers/dom/addAnchorToBody";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";

const fixtureUrl = `${testServerUrl}/test/functional/sandbox/html/alloyTestPage.html`;

const requestLogger = RequestLogger(/v1\/(interact|collect)\?configId=/, {
  logRequestBody: true
});

fixtureFactory({
  title: "C8119: Does not send information about link clicks if disabled.",
  url: fixtureUrl,
  requestHooks: [requestLogger]
});

test.meta({
  ID: "C8119",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C8119: Load page with link. Click link. Verify no request sent.", async () => {
  const testConfig = {
    clickCollectionEnabled: false
  };
  Object.assign(testConfig, baseConfig);
  await configureAlloyInstance("alloy", testConfig);
  await addAnchorToBody({
    text: "Test Link",
    attributes: {
      href: "blank.html",
      id: "alloy-link-test"
    }
  });
  await t.click(Selector("#alloy-link-test"));
  await t.expect(requestLogger.count(() => true)).eql(0);
});
