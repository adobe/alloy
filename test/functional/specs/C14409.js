import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import getResponseBody from "../helpers/networkLogger/getResponseBody";
import fixtureFactory from "../helpers/fixtureFactory";
import cookies from "../helpers/cookies";
import alloyEvent from "../helpers/alloyEvent";
import getConsentCookieName from "../helpers/getConsentCookieName";

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

const setConsentToNone = ClientFunction(() => {
  return window.alloy("setConsent", { general: "out" });
});

test("C14409 - Consenting to no purposes should be persisted.", async () => {
  const imsOrgId = "53A16ACB5CC1D3760A495C99@AdobeOrg";
  await cookies.clear();

  const configure = await alloyEvent("configure", {
    configId: "9999999",
    orgId: imsOrgId,
    debugEnabled: true,
    idMigrationEnabled: false
  });

  await configure.promise;

  // send alloy event
  const event1 = await alloyEvent({
    viewStart: true
  });

  // apply user consent
  await setConsentToNone();

  await event1.promise;

  const cookieName = getConsentCookieName(imsOrgId);

  const consentCheck = await cookies.get(cookieName);

  await t.expect(consentCheck).eql("general=out");

  // test konductor response
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await t
    .expect(networkLogger.edgeEndpointLogs.requests[0].response.statusCode)
    .eql(200);

  const body = getResponseBody(networkLogger.edgeEndpointLogs.requests[0]);
  const bodyObject = JSON.parse(body);

  // read state:store handles from response (i.e. 'set a cookie')
  const cookiesToSet = {};

  await t.expect("handle" in bodyObject).ok();
  await t.expect(bodyObject.handle.length).gt(0);

  await bodyObject.handle.map(handle => {
    if (handle.type !== "state:store") return handle;
    handle.payload.map(payload => {
      cookiesToSet[payload.key] = payload;
      return payload;
    });
    return handle;
  });

  const errorMessage = await t.eval(() =>
    window
      .alloy("event", { data: { a: 1 } })
      .then(() => undefined, e => e.message)
  );

  // expect that konductor cookie handle matches cookie name
  await t.expect(cookieName in cookiesToSet).ok();

  await t.expect(errorMessage).ok("Expected the event command to be rejected");
  await t.expect(errorMessage).contains("The user declined consent.");

  // expect that the cookie max age is greater than 0
  await t.expect("maxAge" in cookiesToSet[cookieName]).ok();
  await t.expect(cookiesToSet[cookieName].maxAge).gt(0);
});
