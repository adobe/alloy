import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import createNetworkLogger from "../../helpers/networkLogger";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import reloadPage from "../../helpers/reloadPage";

const { ADOBE2_IN, ADOBE2_OUT } = require("../../helpers/constants/consent");

const networkLogger = createNetworkLogger();

createFixture({
  title: "C1472434: Set-consent is called when consent is different",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeInteractEndpointLogs
  ]
});

test.meta({
  ID: "C1472434",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

const configuration = {
  defaultConsent: "pending",
  ...orgMainConfigMain
};

test("C1472434: Set-consent is called when consent is different", async () => {
  // set consent to in
  const alloy = createAlloyProxy();
  await alloy.configure(configuration);
  await alloy.setConsent(ADOBE2_IN);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  // reload the page to make sure the hashes are stored and not just in memory
  await reloadPage();
  await alloy.configure(configuration);

  // send an event which should go out immediately
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(1);

  // set the consent on Alloy, and make sure it generates a new edge request
  await alloy.setConsent(ADOBE2_OUT);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(2);
});
