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
    "C455258: sendEvent command sends a request to the collect endpoint using sendBeacon when documentUnloading is set to true.",
  requestHooks: [networkLogger.edgeCollectEndpointLogs]
});

test.meta({
  ID: "C455258",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const sendEvent = ClientFunction(() => {
  return window
    .alloy("sendEvent", {
      documentUnloading: true
    })
    .catch(() => {
      // Because documentUnloading is set to true, Alloy uses sendBeacon and
      // since sendBeacon ignores any response from the server, no identity
      // cookie gets established for the user, resulting in the error:
      //
      // "An identity was not set properly. Please verify that the org ID
      // 334F60F35E1597910A495EC2@AdobeOrg configured in Alloy matches the
      // org ID specified in the edge configuration."
      //
      // This is probably something we want to address and is logged here:
      // https://jira.corp.adobe.com/browse/CORE-52954
      //
      // Until then, we'll ignore the error.
    });
});

test("Test C455258: sendEvent command sends a request to the collect endpoint using sendBeacon when documentUnloading is set to true.", async () => {
  if (isSendBeaconSupported()) {
    await sendBeaconMock.mock();
  }
  await configureAlloyInstance("alloy", orgMainConfigMain);
  await sendEvent();
  await t.expect(networkLogger.edgeCollectEndpointLogs.requests.length).eql(1);
  if (isSendBeaconSupported()) {
    await t.expect(sendBeaconMock.getCallCount()).eql(1);
  }
});
