import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import createConsoleLogger from "../../helpers/consoleLogger";

const { CONSENT_OUT } = require("../../helpers/constants/consent");

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

const setConsentToOut = ClientFunction(
  () => {
    return window.alloy("setConsent", CONSENT_OUT);
  },
  { dependencies: { CONSENT_OUT } }
);

const configure = ClientFunction(() => {
  return {
    promise: window.alloy("configure", {
      edgeConfigId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
      orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
      defaultConsent: "pending",
      idMigrationEnabled: false,
      debugEnabled: true
    })
  };
});

test("C14409 - Consenting to no purposes should be persisted.", async () => {
  await configure();

  await setConsentToOut();

  // Reload page and reconfigure alloy
  // [TODO] Navigate to a different subdomain when it is available
  // https://github.com/DevExpress/testcafe/blob/a4f6a4ac3627ebeb29b344ed3a1793627dd87909/docs/articles/documentation/test-api/actions/navigate.md
  await t.eval(() => document.location.reload());

  await configure();
  const logger = await createConsoleLogger();
  await t.eval(() => window.alloy("sendEvent"));
  await logger.warn.expectMessageMatching(/user declined consent/);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);
});
