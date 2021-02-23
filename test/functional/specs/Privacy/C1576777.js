import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import createNetworkLogger from "../../helpers/networkLogger";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain";
import reloadPage from "../../helpers/reloadPage";
import cookies from "../../helpers/cookies";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { MAIN_IDENTITY_COOKIE_NAME } from "../../helpers/constants/cookies";

const { ADOBE2_OUT } = require("../../helpers/constants/consent");

const networkLogger = createNetworkLogger();

createFixture({
  title: "C1576777: When identity cookie is missing, stored consent is cleared",
  requestHooks: [
    networkLogger.setConsentEndpointLogs,
    networkLogger.edgeInteractEndpointLogs
  ]
});

test.meta({
  ID: "C1576777",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

const configuration = {
  defaultConsent: "in",
  debugEnabled: true,
  idMigrationEnabled: true,
  thirdPartyCookiesEnabled: false,
  ...orgMainConfigMain
};

test("C1576777: When identity cookie is missing, stored consent is cleared", async () => {
  // set consent to in
  const alloy = createAlloyProxy();
  await alloy.configure(configuration);
  await alloy.setConsent(ADOBE2_OUT);

  // delete identity cookie, and reload
  await reloadPage();
  await cookies.remove(MAIN_IDENTITY_COOKIE_NAME);
  await alloy.configure(configuration);

  // try to send an event it should go out since the stored consent should be cleared
  await alloy.sendEvent();

  // reload again because now we have an identity cookie
  await reloadPage();
  await alloy.configure(configuration);
  await alloy.sendEvent();

  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(1);
});
