import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import flushPromiseChains from "../../helpers/flushPromiseChains";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain";
import { compose, consentPending } from "../../helpers/constants/configParts";
import testServerUrl from "../../helpers/constants/testServerUrl";

const { CONSENT_IN } = require("../../helpers/constants/consent");

const networkLogger = createNetworkLogger();

createFixture({
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

const changeHashAndConsent = ClientFunction(
  () => {
    window.location.hash = "foo";
    return window.alloy("setConsent", CONSENT_IN);
  },
  { dependencies: { CONSENT_IN } }
);

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
  await t.expect(getContextUrlFromRequest(requests[0])).eql(testServerUrl);
  await t
    .expect(getContextUrlFromRequest(requests[1]))
    .eql(`${testServerUrl}#foo`);
});
