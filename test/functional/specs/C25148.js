import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import createConsoleLogger from "../helpers/consoleLogger";
import {
  compose,
  debugEnabled,
  orgMainConfigMain
} from "../helpers/constants/configParts";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C25148 - When default consent is 'in', consent can be revoked.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C25148",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("sendEvent", {});
});

const setConsentOut = ClientFunction(() => {
  return window.alloy("setConsent", { general: "out" });
});

test("C25148 - When default consent is 'in', consent can be revoked", async () => {
  await configureAlloyInstance(
    "alloy",
    compose(
      orgMainConfigMain,
      debugEnabled
    )
  );

  // trigger an event
  await triggerAlloyEvent();

  // revoke user consent
  await setConsentOut();

  // trigger a second event
  const logger = await createConsoleLogger();
  await triggerAlloyEvent();
  await logger.warn.expectMessageMatching(/user declined consent/);

  // ensure only one event was sent
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  const stringifyRequest = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );
  await t.expect(stringifyRequest.events.length).eql(1);
});
