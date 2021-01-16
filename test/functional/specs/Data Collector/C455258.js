import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import sendBeaconMock from "../../helpers/sendBeaconMock";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import isSendBeaconSupported from "../../helpers/isSendBeaconSupported";

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C455258: sendEvent command sends a request to the collect endpoint using sendBeacon when documentUnloading is set to true but only when identity has established.",
  requestHooks: [
    networkLogger.edgeInteractEndpointLogs,
    networkLogger.edgeCollectEndpointLogs
  ]
});

test.meta({
  ID: "C455258",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const sendEvent = ClientFunction(({ documentUnloading }) => {
  return window.alloy("sendEvent", {
    documentUnloading
  });
});

test("Test C455258: sendEvent command sends a request to the collect endpoint when identity has been established and documentUnloading is set to true, interact otherwise.", async () => {
  if (isSendBeaconSupported()) {
    await sendBeaconMock.mock();
  }
  await configureAlloyInstance("alloy", orgMainConfigMain);

  // An identity has not yet been established. This request should go to the
  // interact endpoint.
  await sendEvent({
    documentUnloading: true
  });

  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(1);
  await t.expect(networkLogger.edgeCollectEndpointLogs.requests.length).eql(0);

  if (isSendBeaconSupported()) {
    await t.expect(sendBeaconMock.getCallCount()).eql(0);
  }

  // An identity has been established. This request should go to the
  // collect endpoint.
  await sendEvent({
    documentUnloading: true
  });

  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(1);
  await t.expect(networkLogger.edgeCollectEndpointLogs.requests.length).eql(1);

  if (isSendBeaconSupported()) {
    await t.expect(sendBeaconMock.getCallCount()).eql(1);
  }

  // documentUnloading is not set to true. The request should go to the
  // interact endpoint.
  await sendEvent({});

  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(2);
  await t.expect(networkLogger.edgeCollectEndpointLogs.requests.length).eql(1);
  if (isSendBeaconSupported()) {
    await t.expect(sendBeaconMock.getCallCount()).eql(1);
  }
});
