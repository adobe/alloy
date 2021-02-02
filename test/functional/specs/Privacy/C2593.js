import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import environmentContextConfig from "../../helpers/constants/environmentContextConfig";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import flushPromiseChains from "../../helpers/flushPromiseChains";
import { CONSENT_IN } from "../../helpers/constants/consent";

const networkLogger = createNetworkLogger();

createFixture({
  title: "C2593: Event command sets consent to in.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2593",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

test("Test C2593: Event command consents to all purposes", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure({
    defaultConsent: "pending",
    ...environmentContextConfig
  });
  // try to send an event and verify that it is queued
  const sendEventResponse = await alloy.sendEventAsync();
  await flushPromiseChains();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);

  // set the consent to in
  await alloy.setConsent(CONSENT_IN);

  // ensure the event goes out
  await sendEventResponse.promise;
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
});
