import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import createConsoleLogger from "../../helpers/consoleLogger";
import {
  compose,
  debugEnabled,
  orgMainConfigMain
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { CONSENT_OUT } from "../../helpers/constants/consent";

const networkLogger = createNetworkLogger();

createFixture({
  title: "C25148 - When default consent is 'in', consent can be revoked.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C25148",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const config = compose(
  orgMainConfigMain,
  debugEnabled
);

test("C25148 - When default consent is 'in', consent can be revoked", async () => {
  const alloy = createAlloyProxy("alloy");
  await alloy.configure(config);

  // trigger an event
  await alloy.sendEvent();

  // revoke user consent
  await alloy.setConsent(CONSENT_OUT);

  // trigger a second event
  const logger = await createConsoleLogger();
  await alloy.sendEvent();
  await logger.warn.expectMessageMatching(/user declined consent/);

  // ensure only one event was sent
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  const stringifyRequest = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );
  await t.expect(stringifyRequest.events.length).eql(1);
});
