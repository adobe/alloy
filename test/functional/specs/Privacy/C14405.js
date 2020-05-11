import fixtureFactory from "../../helpers/fixtureFactory";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import createNetworkLogger from "../../helpers/networkLogger";

import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../helpers/constants/configParts";
import { CONSENT_IN } from "../../helpers/constants/consent";

const config = compose(
  orgMainConfigMain,
  consentPending,
  debugEnabled
);

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C14405: Unidentified user can consent to all purposes",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14405",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C14405: Unidentified user can consent to all purposes", async t => {
  await configureAlloyInstance("alloy", config);
  await t.eval(() => window.alloy("setConsent", CONSENT_IN));
  await t.eval(() => window.alloy("sendEvent", { xdm: { key: "value" } }));

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  const request = networkLogger.edgeEndpointLogs.requests[0].request.body;
  await t.expect(request).contains('"key":"value"');
});
