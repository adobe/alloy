import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import fixtureFactory from "../helpers/fixtureFactory";
import alloyEvent from "../helpers/alloyEvent";
import debugEnabledConfig from "../helpers/constants/debugEnabledConfig";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C14407 - Consenting to all purposes should be persisted.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14407",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const setConsentIn = ClientFunction(() => {
  return window.alloy("setConsent", { general: "in" });
});

const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("event", {});
});

const imsOrgId = "334F60F35E1597910A495EC2@AdobeOrg";
const configure = () => {
  return alloyEvent("configure", {
    configId: "9999999",
    orgId: imsOrgId,
    defaultConsent: { general: "pending" },
    idMigrationEnabled: false,
    ...debugEnabledConfig
  });
};

test("C14407 - Consenting to all purposes should be persisted.", async () => {
  await configure();

  await setConsentIn();

  await t.eval(() => document.location.reload());
  await configure();

  await triggerAlloyEvent();
});
