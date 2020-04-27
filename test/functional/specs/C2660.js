import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import flushPromiseChains from "../helpers/flushPromiseChains";
import orgMainConfigMain from "../helpers/constants/configParts/orgMainConfigMain";
import { compose, consentPending } from "../helpers/constants/configParts";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C2660 - Context data is captured before user consents.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2660",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const sendEvent = ClientFunction(() => {
  window.alloy("sendEvent");
});

const changeHashAndConsent = ClientFunction(() => {
  window.location.hash = "foo";
  return window.alloy("setConsent", {
    purposes: {
      general: "in"
    }
  });
});

const getContextUrlFromRequest = request => {
  const parsedBody = JSON.parse(request.request.body);
  return parsedBody.events[0].xdm.web.webPageDetails.URL;
};

test("C2660 - Context data is captured before user consents.", async () => {
  await configureAlloyInstance(
    compose(
      orgMainConfigMain,
      consentPending
    )
  );

  await sendEvent();
  await flushPromiseChains();
  await changeHashAndConsent();
  await sendEvent();
  await flushPromiseChains();

  // expect that we made two requests
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);

  const requests = networkLogger.edgeEndpointLogs.requests;
  await t
    .expect(getContextUrlFromRequest(requests[0]))
    .eql("https://alloyio.com/functional-test/alloyTestPage.html");
  await t
    .expect(getContextUrlFromRequest(requests[1]))
    .eql("https://alloyio.com/functional-test/alloyTestPage.html#foo");
});
