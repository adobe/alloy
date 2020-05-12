import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import fixtureFactory from "../../helpers/fixtureFactory";
import environmentContextConfig from "../../helpers/constants/environmentContextConfig";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";

const { CONSENT_IN } = require("../../helpers/constants/consent");

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

const triggerEventThenConsent = ClientFunction(
  () => {
    return new Promise(resolve => {
      const eventPromise = window.alloy("sendEvent", { xdm: { key: "value" } });
      window.alloy("setConsent", CONSENT_IN).then(() => {
        eventPromise.then(resolve);
      });
    });
  },
  { dependencies: { CONSENT_IN } }
);

test("Test C2593: Event command consents to all purposes", async () => {
  await configureAlloyInstance("alloy", {
    defaultConsent: "pending",
    ...environmentContextConfig
  });
  await triggerEventThenConsent();

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
});
