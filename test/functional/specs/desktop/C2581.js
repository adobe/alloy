import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import fixtureFactory from "../../helpers/fixtureFactory";
import testServerUrl from "../../helpers/constants/testServerUrl";

import debugEnabledConfig from "../../helpers/constants/debugEnabledConfig";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/alloyTestPage.html`;

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C2581: Queue events when no ECID available on client",
  url: urlCollector,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2581",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvents = ClientFunction(() => {
  window.alloy("event", { viewStart: true, data: { key: "value" } });
  window.alloy("event", { data: { key: "value" } });
  window.alloy("event", { data: { key: "value" } });
});

const identityCookieName = "kndctr_53A16ACB5CC1D3760A495C99_AdobeOrg_identity";

test("Test C2581: Queue requests until we receive an ECID.", async () => {
  await configureAlloyInstance("alloy", debugEnabledConfig);

  await triggerAlloyEvents();

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  await t.wait(1000);

  const responseBody = getResponseBody(
    networkLogger.edgeEndpointLogs.requests[0]
  );
  const response = networkLogger.edgeEndpointLogs.requests[0].response;
  const responseHeader = response.headers;

  const stringifiedResponseBody = JSON.stringify(responseBody);

  const hasIdentityCookieInBody = stringifiedResponseBody.includes(
    identityCookieName
  );

  const hasIdentityCookieHeader = responseHeader["set-cookie"]
    ? responseHeader["set-cookie"].includes(identityCookieName)
    : false;

  // Check that the identity cookie/state is either in the body or header.
  await t.expect(hasIdentityCookieInBody || hasIdentityCookieHeader).eql(true);

  // At this point, we should have received the identity and the other 2 requests
  // should have been unblocked.
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(3);
});
