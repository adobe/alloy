import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import flushPromiseChains from "../../helpers/flushPromiseChains";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain";
import { compose, consentPending } from "../../helpers/constants/configParts";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { CONSENT_IN } from "../../helpers/constants/consent";

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

const getContextUrlFromRequest = request => {
  const parsedBody = JSON.parse(request.request.body);
  return parsedBody.events[0].xdm.web.webPageDetails.URL;
};

test("C2660 - Context data is captured before user consents.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(
    compose(
      orgMainConfigMain,
      consentPending
    )
  );

  // send an event that will be queued
  const sendEventResponse = await alloy.sendEventAsync();
  await flushPromiseChains();

  // change something that will be collected by Context Component
  await t.eval(() => {
    window.location.hash = "foo";
  });

  // set consent to flush the events queue
  await alloy.setConsent(CONSENT_IN);
  await sendEventResponse.result;

  // send another event to make sure the foo hash is collected normally
  await alloy.sendEvent();

  // expect that context was captured at the right time
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);
  const requests = networkLogger.edgeEndpointLogs.requests;
  await t.expect(getContextUrlFromRequest(requests[0])).eql(TEST_PAGE_URL);
  await t
    .expect(getContextUrlFromRequest(requests[1]))
    .eql(`${TEST_PAGE_URL}#foo`);
});
