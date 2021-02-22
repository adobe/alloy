import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import createConsoleLogger from "../../helpers/consoleLogger";
import { CONSENT_OUT } from "../../helpers/constants/consent";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import reloadPage from "../../helpers/reloadPage";

const networkLogger = createNetworkLogger();

createFixture({
  title: "C14409 - Consenting to no purposes should be persisted.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14409",
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

test("C14409 - Consenting to no purposes should be persisted.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_OUT);
  // Reload page and reconfigure alloy
  // [TODO] Navigate to a different subdomain when it is available
  // https://github.com/DevExpress/testcafe/blob/a4f6a4ac3627ebeb29b344ed3a1793627dd87909/docs/articles/documentation/test-api/actions/navigate.md
  await reloadPage();

  await alloy.configure(config);
  const logger = await createConsoleLogger();
  await alloy.sendEvent();
  await logger.warn.expectMessageMatching(/user declined consent/);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);
});
