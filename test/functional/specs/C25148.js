import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import fixtureFactory from "../helpers/fixtureFactory";
import environmentContextConfig from "../helpers/constants/environmentContextConfig";
import configureAlloyInstance from "../helpers/configureAlloyInstance";

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
  return window.alloy("event", {});
});

const setConsentOut = ClientFunction(() => {
  return window.alloy("setConsent", { general: "out" });
});

test("C25148 - When default consent is 'in', consent can be revoked", async () => {
  await configureAlloyInstance("alloy", {
    defaultConsent: { general: "in" },
    ...environmentContextConfig
  });

  // trigger an event
  await triggerAlloyEvent();

  // revoke user consent
  await setConsentOut();

  // trigger a second event
  const promise = triggerAlloyEvent();

  // catch the error message
  let errMsg = "";
  await promise.catch(e => {
    errMsg = e.errMsg;
  });

  // ensure the error message matches the user declining consent
  await t.expect(errMsg.match(/The user declined consent/)).ok();

  // ensure only one event was sent
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  const stringifyRequest = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );
  await t.expect(stringifyRequest.events.length).eql(1);
});
