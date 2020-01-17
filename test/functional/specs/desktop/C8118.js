import { t, Selector, RequestLogger } from "testcafe";
import testServerUrl from "../../helpers/constants/testServerUrl";
import fixtureFactory from "../../helpers/fixtureFactory";

const linkPageWithClickHandler = `${testServerUrl}/test/functional/sandbox/html/linkPageWithClickHandler.html`;

const requestLogger = RequestLogger(/v1\/(interact|collect)\?configId=/, {
  logRequestBody: true
});

fixtureFactory({
  title: "C8118: Send information about link clicks.",
  url: linkPageWithClickHandler,
  requestHooks: [requestLogger]
});

test.meta({
  ID: "C8118",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C8118: Load page with link. Click link. Verify request.", async () => {
  await t.click(Selector("#alloy-link-test"));
  await t.expect(requestLogger.count(() => true)).gt(0);
  const gatewayRequest = requestLogger.requests[0];
  const requestBody = JSON.parse(gatewayRequest.request.body);
  const destinationUrl = requestBody.events[0].xdm.web.webInteraction.URL;
  await t.expect(destinationUrl).contains("blank.html");
});
