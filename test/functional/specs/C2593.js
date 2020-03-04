import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import { responseStatus } from "../helpers/assertions/index";
import fixtureFactory from "../helpers/fixtureFactory";
import environmentContextConfig from "../helpers/constants/environmentContextConfig";
import configureAlloyInstance from "../helpers/configureAlloyInstance";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C2593: Event command sets consent to in.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2593",
  SEVERITY: "P0",
  TEST_RUN: "REGRESSION"
});

const setConsentToIn = ClientFunction(() => {
  return window.alloy("setConsent", { general: "in" });
});
// execute an event command with no request sent
const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("event");
});

test("Test C2593: Event command consents to all purposes", async () => {
  // SDK installed and configured with defaultConsent: { general: "pending" }
  await configureAlloyInstance("alloy", {
    defaultConsent: { general: "pending" },
    ...environmentContextConfig
  });
  // trigger alloy event
  const promise = triggerAlloyEvent();

  // set consent to in
  await setConsentToIn();
  await promise;

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 204);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
});
