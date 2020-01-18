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
  title: "C8118: Send information about link clicks.",
  url: fixtureUrl,
  requestHooks: [requestLogger]
});

test.meta({
  ID: "C8118",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C8118: Load page with link. Click link. Verify request.", async () => {
  await configureAlloyInstance("alloy", baseConfig);
  await addAnchorToBody({
    text: "Test Link",
    attributes: {
      href: "blank.html",
      id: "alloy-link-test"
    }
  });
  await t.click(Selector("#alloy-link-test"));
  await t.expect(requestLogger.count(() => true)).gt(0);
  const gatewayRequest = requestLogger.requests[0];
  const requestBody = JSON.parse(gatewayRequest.request.body);
  const destinationUrl = requestBody.events[0].xdm.web.webInteraction.URL;
  await t.expect(destinationUrl).contains("blank.html");
});
