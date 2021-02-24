import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import createNetworkLogger from "../../helpers/networkLogger";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const { ADOBE2_IN } = require("../../helpers/constants/consent");

const networkLogger = createNetworkLogger();

createFixture({
  title: "C1472433: Set-consent is not called when consent is the same",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeInteractEndpointLogs
  ]
});

test.meta({
  ID: "C1472433",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

const configuration = {
  defaultConsent: "pending",
  ...orgMainConfigMain
};

test("C1472433 - Set-consent is not called when consent is the same", async () => {
  // set consent to in
  const alloy = createAlloyProxy();
  await alloy.configure(configuration);
  await alloy.setConsent(ADOBE2_IN);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  // reload the page to make sure the hashes are stored
  await t.eval(() => document.location.reload());
  await t.wait(1000);
  await alloy.configure(configuration);

  // send an event which should go out immediately
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(1);

  // set the consent to in again, and make sure an edge request isn't generated.
  await alloy.setConsent(ADOBE2_IN);
  await t.wait(1000);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);
});
