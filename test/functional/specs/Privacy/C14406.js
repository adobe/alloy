import fixtureFactory from "../../helpers/fixtureFactory";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import createNetworkLogger from "../../helpers/networkLogger";
import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../helpers/constants/configParts";
import createConsoleLogger from "../../helpers/consoleLogger";

const { CONSENT_OUT } = require("../../helpers/constants/consent");

const config = compose(
  orgMainConfigMain,
  consentPending,
  debugEnabled
);

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C14406: Unidentified user can consent to no purposes",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14406",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14406: Unidentified user can consent to no purposes", async t => {
  const logger = await createConsoleLogger();
  await configureAlloyInstance("alloy", config);
  await t.eval(() => window.alloy("setConsent", CONSENT_OUT), {
    dependencies: { CONSENT_OUT }
  });
  await t.eval(() => window.alloy("sendEvent"));
  await logger.warn.expectMessageMatching(/user declined consent/);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);
});
