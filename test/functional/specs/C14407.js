import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import getResponseBody from "../helpers/networkLogger/getResponseBody";
import fixtureFactory from "../helpers/fixtureFactory";
import cookies from "../helpers/cookies";
import alloyEvent from "../helpers/alloyEvent";
import debugEnabledConfig from "../helpers/constants/debugEnabledConfig";
import getConsentCookieName from "../helpers/getConsentCookieName";
import createResponse from "../../../src/core/createResponse";

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

test("C14407 - Consenting to all purposes should be persisted.", async () => {
  const imsOrgId = "334F60F35E1597910A495EC2@AdobeOrg";
  await cookies.clear();
  // await apiCalls(imsOrgId);

  const configure = await alloyEvent("configure", {
    idMigrationEnabled: false,
    ...debugEnabledConfig
  });

  await configure.promise;

  // send alloy event
  const event1 = await alloyEvent({
    viewStart: true
  });

  // apply user consent
  await setConsentIn();

  await event1.promise;

  const cookieName = getConsentCookieName(imsOrgId);

  const consentCheck = await cookies.get(cookieName);

  await t.expect(consentCheck).eql("general=in");

  // test konductor response
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
  await t
    .expect(networkLogger.edgeEndpointLogs.requests[0].response.statusCode)
    .eql(200);

  const request = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );

  // read state:store handles from response (i.e. 'set a cookie')
  await t.expect("handle" in request).ok();
  await t.expect(request.handle.length).gt(0);

  const storePayloads = createResponse(request).getPayloadsByType(
    "state:store"
  );
  const cookiesToSet = storePayloads.reduce((memo, storePayload) => {
    memo[storePayload.key] = storePayload;
    return memo;
  }, {});

  // expect that konductor cookie handle matches cookie name
  await t.expect(cookieName in cookiesToSet).ok();

  await t.expect("maxAge" in cookiesToSet[cookieName]).ok();
  await t.expect(cookiesToSet[cookieName].maxAge).eql(15552000);
});
