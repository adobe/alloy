import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import createNetworkLogger from "../../helpers/networkLogger";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain";
import flushPromiseChains from "../../helpers/flushPromiseChains";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const { ADOBE2_OUT } = require("../../helpers/constants/consent");

const networkLogger = createNetworkLogger();

createFixture({
  title: "C1472438: Adobe consent version 2.0 is translated to general=out",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeInteractEndpointLogs
  ]
});

test.meta({
  ID: "C1472438",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

const configuration = {
  defaultConsent: "pending",
  ...orgMainConfigMain
};

test("C1472438: Adobe consent version 2.0 is translated to general=out", async () => {
  // setup alloy
  const alloy = createAlloyProxy();
  await alloy.configure(configuration);

  // try to send an event, but it should be queued
  const sendEventResponse = await alloy.sendEventAsync();
  await flushPromiseChains();
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(0);

  // set the consent to OUT
  await alloy.setConsent(ADOBE2_OUT);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  // make sure the event does not go out
  await sendEventResponse.promise;
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(0);
});
