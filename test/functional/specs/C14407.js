import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import getResponseBody from "../helpers/networkLogger/getResponseBody";
import fixtureFactory from "../helpers/fixtureFactory";
import cookies from "../helpers/cookies";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain,
  migrationDisabled,
  debugEnabled
} from "../helpers/constants/configParts";

const config = compose(
  orgMainConfigMain,
  migrationDisabled,
  debugEnabled
);

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

const sendEventWithDelay = ClientFunction((data, delay) => {
  return new Promise(resolve => {
    window.alloy("event", data);
    setTimeout(() => {
      resolve();
    }, delay || 100);
  });
});

test("C14407 - Consenting to all purposes should be persisted.", async () => {
  const imsOrgId = "334F60F35E1597910A495EC2@AdobeOrg";
  await cookies.clear();

  await configureAlloyInstance(config);

  // send alloy event
  await sendEventWithDelay({
    viewStart: true
  });

  // apply user consent
  await setConsentIn();

  const cookieName = `kndctr_${imsOrgId.replace(
    /[@]+?/,
    "_"
  )}_consent`.toString();

  const consentCheck = await cookies.get(cookieName);

  await t.expect(consentCheck).eql("general=in");

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

  // expect that konductor cookie handle matches cookie name
  await t.expect(cookieName in cookiesToSet).ok();

  // expect that the cookie max age is greater than 0
  await t.expect("maxAge" in cookiesToSet[cookieName]).ok();
  await t.expect(cookiesToSet[cookieName].maxAge).gt(0);
});
