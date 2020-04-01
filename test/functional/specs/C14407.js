import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import fixtureFactory from "../helpers/fixtureFactory";
import cookies from "../helpers/cookies";
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
  return new Promise(resolve => {
    window.alloy("event", { xdm: { key: "value" } }).then(() => resolve());
  });
});

test("C14407 - Consenting to all purposes should be persisted.", async () => {
  const imsOrgId = "334F60F35E1597910A495EC2@AdobeOrg";
  await cookies.clear();

  // configure alloy with default consent set to pending
  const configure = await alloyEvent("configure", {
    configId: "9999999",
    orgId: imsOrgId,
    defaultConsent: { general: "pending" },
    idMigrationEnabled: false,
    ...debugEnabledConfig
  });

  await configure.promise;

  // set consent to in
  await setConsentIn();

  // reload the page and reconfigure alloy after page reload
  await t.eval(() => document.location.reload());

  const reconfigure = await alloyEvent("configure", {
    configId: "9999999",
    orgId: imsOrgId,
    debugEnabled: true,
    idMigrationEnabled: false
  });

  await reconfigure.promise;

  await triggerAlloyEvent();

  await t.eval(() => window.alloy("setConsent", { general: "in" }));
  await t.eval(() => window.alloy("event", { data: { key: "value" } }));
});
