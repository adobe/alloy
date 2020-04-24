import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import createNetworkLogger from "../helpers/networkLogger";

import {
  compose,
  orgMainConfigMain,
  consentPending
} from "../helpers/constants/configParts";

const config = compose(
  orgMainConfigMain,
  consentPending
);

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C2594: event command rejects promise if user consents to no purposes",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2594",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2594: event command rejects promise if user consents to no purposes", async t => {
  await configureAlloyInstance("alloy", config);
  const errorMessagePromise = t.eval(() =>
    window
      .alloy("sendEvent", { data: { a: 1 } })
      .then(() => undefined, e => e.message)
  );
  await t.eval(() => window.alloy("setConsent", { general: "out" }));
  const errorMessage = await errorMessagePromise;

  await t.expect(errorMessage).ok("Expected the event command to be rejected");
  await t.expect(errorMessage).contains("The user declined consent.");
  // make sure no event requests were sent out
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);
});
