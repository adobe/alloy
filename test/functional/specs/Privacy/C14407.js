import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import { CONSENT_IN } from "../../helpers/constants/consent";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import reloadPage from "../../helpers/reloadPage";

const networkLogger = createNetworkLogger();

createFixture({
  title: "C14407 - Consenting to all purposes should be persisted.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14407",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const config = {
  edgeConfigId: "9999999",
  orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
  defaultConsent: "pending",
  idMigrationEnabled: false,
  debugEnabled: true
};

test("C14407 - Consenting to all purposes should be persisted.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_IN);
  await reloadPage();
  await alloy.configure(config);
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
});
