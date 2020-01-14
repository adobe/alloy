import { t, Selector, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import { responseStatus } from "../../helpers/assertions/index";
import fixtureFactory from "../../helpers/fixtureFactory";
import testServerUrl from "../../helpers/constants/testServerUrl";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/alloySdk.html`;

const networkLogger = createNetworkLogger();

fixtureFactory({
  title:
    "C2582 - When ECID is available on client, allow all requests to be promptly sent using the ECID",
  url: urlCollector,
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    networkLogger.gatewayEndpointLogs
  ]
});

test.meta({
  ID: "C2582",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2582: Once the identity cookie is available, requests should go out promptly (in parallel) and should contain the ECID.", async () => {
  await t.click(Selector("#debugEnabled-button"));
  await t.click(Selector("#event-button"));

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const ecidResponse = getResponseBody(
    networkLogger.edgeEndpointLogs.requests[0]
  );

  const stringifyResponse = JSON.stringify(ecidResponse);
  await t.expect(stringifyResponse).contains("ECID");

  const getCookie = ClientFunction(() => {
    return document.cookie;
  });

  await t
    .expect(getCookie())
    .contains("kndctr_53A16ACB5CC1D3760A495C99_AdobeOrg_identity");

  await t.click(Selector("#debugEnabled-button"));
  await t.click(Selector("#event-button"));

  await responseStatus(networkLogger.gatewayEndpointLogs.requests, 204);
  await t.expect(networkLogger.gatewayEndpointLogs.requests.length).eql(1);

  const edgeRequest = networkLogger.gatewayEndpointLogs.requests[0];
  await t.expect(edgeRequest.request.body).contains("ECID");
});
