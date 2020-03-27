import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import fixtureFactory from "../helpers/fixtureFactory";
import cookies from "../helpers/cookies";
import alloyEvent from "../helpers/alloyEvent";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C14409 - Consenting to no purposes should be persisted.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14409",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const setConsentToOut = ClientFunction(() => {
  return window.alloy("setConsent", { general: "out" });
});

test("C14409 - Consenting to no purposes should be persisted.", async () => {
  const imsOrgId = "53A16ACB5CC1D3760A495C99@AdobeOrg";
  await cookies.clear();

  // configure alloy
  const configure = await alloyEvent("configure", {
    configId: "9999999",
    orgId: imsOrgId,
    debugEnabled: true,
    idMigrationEnabled: false
  });

  await configure.promise;

  // set consent to out
  await setConsentToOut();

  // Reload page and reconfigure alloy
  // [TODO] Navigate to a different subdomain when it is available
  // https://github.com/DevExpress/testcafe/blob/a4f6a4ac3627ebeb29b344ed3a1793627dd87909/docs/articles/documentation/test-api/actions/navigate.md
  await t.eval(() => document.location.reload());

  const reconfigure = await alloyEvent("configure", {
    configId: "9999999",
    orgId: imsOrgId,
    debugEnabled: true,
    idMigrationEnabled: false
  });

  await reconfigure.promise;

  // send event
  const errorMessage = await t.eval(() =>
    window
      .alloy("event", { data: { a: 1 } })
      .then(() => undefined, e => e.message)
  );

  // check that the promise from the command is rejected and check the error message to make sure it was due to the user being opted out.
  await t.expect(errorMessage).ok("Expected the event command to be rejected");
  await t.expect(errorMessage).contains("The user declined consent.");
});
