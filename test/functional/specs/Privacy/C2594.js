import createFixture from "../../helpers/createFixture";
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

createFixture({
  title:
    "C2594: event command resolves promise with empty object if user consents to no purposes",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2594",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2594: event command resolves promise with empty object if user consents to no purposes", async t => {
  await configureAlloyInstance("alloy", config);
  const logger = await createConsoleLogger();
  const sendEventPromise = t.eval(() => window.alloy("sendEvent"));
  await t.eval(() => window.alloy("setConsent", CONSENT_OUT), {
    dependencies: { CONSENT_OUT }
  });
  const result = await sendEventPromise;
  await t.expect(result).eql({});
  await logger.warn.expectMessageMatching(/user declined consent/);
  // make sure no event requests were sent out
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);
});
