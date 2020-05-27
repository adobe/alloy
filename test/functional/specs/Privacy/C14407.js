import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";

const { CONSENT_IN } = require("../../helpers/constants/consent");

const networkLogger = createNetworkLogger();

createFixture({
  title: "C14407 - Consenting to all purposes should be persisted.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14407",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const setConsentIn = ClientFunction(
  () => {
    return window.alloy("setConsent", CONSENT_IN);
  },
  { dependencies: { CONSENT_IN } }
);

const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("sendEvent", {});
});

const configure = ClientFunction(() => {
  return {
    promise: window.alloy("configure", {
      edgeConfigId: "9999999",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
      defaultConsent: "pending",
      idMigrationEnabled: false,
      debugEnabled: true
    })
  };
});

test("C14407 - Consenting to all purposes should be persisted.", async () => {
  await configure();

  await setConsentIn();

  await t.eval(() => document.location.reload());
  await configure();

  await triggerAlloyEvent();
});
