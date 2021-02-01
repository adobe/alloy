import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import createNetworkLogger from "../../helpers/networkLogger";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain";
import reloadPage from "../../helpers/reloadPage";
import flushPromiseChains from "../../helpers/flushPromiseChains";
import cookies from "../../helpers/cookies";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { MAIN_IDENTITY_COOKIE_NAME } from "../../helpers/constants/cookies";

const { ADOBE2_IN } = require("../../helpers/constants/consent");

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C1472435: Set-consent is called when identity cookie is missing even though consent is the same",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeInteractEndpointLogs
  ]
});

test.meta({
  ID: "C1472435",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

const configuration = {
  defaultConsent: "pending",
  ...orgMainConfigMain
};

test("C1472435: Set-consent is called when identity cookie is missing even though consent is the same", async () => {
  // set consent to in
  const alloy = createAlloyProxy("alloy");
  await alloy.configure(configuration);
  await alloy.setConsent(ADOBE2_IN);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(1);

  // delete identity cookie, and reload
  await reloadPage();
  await cookies.drop(MAIN_IDENTITY_COOKIE_NAME);
  await alloy.configure(configuration);

  // try to send an event, but it should be queued
  const sendEventResponse = await alloy.sendEventAsync();
  await flushPromiseChains();
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(0);

  // set the consent to IN
  await alloy.setConsent(ADOBE2_IN);
  await t.expect(networkLogger.setConsentEndpointLogs.requests.length).eql(2);

  // make sure the event goes out
  await sendEventResponse.promise;
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(1);
});
