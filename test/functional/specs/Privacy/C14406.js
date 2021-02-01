import createFixture from "../../helpers/createFixture";
import createNetworkLogger from "../../helpers/networkLogger";
import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../helpers/constants/configParts";
import createConsoleLogger from "../../helpers/consoleLogger";

import { CONSENT_OUT } from "../../helpers/constants/consent";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const config = compose(
  orgMainConfigMain,
  consentPending,
  debugEnabled
);

const networkLogger = createNetworkLogger();

createFixture({
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
  const alloy = createAlloyProxy("alloy");
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_OUT);
  await alloy.sendEvent();
  await logger.warn.expectMessageMatching(/user declined consent/);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);
});
