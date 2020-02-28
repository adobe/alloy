import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import getResponseBody from "../helpers/networkLogger/getResponseBody";
import { responseStatus } from "../helpers/assertions";
import fixtureFactory from "../helpers/fixtureFactory";
import createResponse from "../../../src/core/createResponse";
import generalConstants from "../helpers/constants/general";

const networkLogger = createNetworkLogger();
const { ecidRegex } = generalConstants;

fixtureFactory({
  title:
    "C14402: When ID migration is enabled and no legacy AMCV cookie is found, an AMCV cookie should be created",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14402",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const apiCalls = ClientFunction(() => {
  window.alloy("configure", {
    configId: "9999999",
    orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
    edgeBasePath: window.edgeBasePath,
    debugEnabled: true,
    idMigrationEnabled: true
  });

  return window.alloy("event", {
    viewStart: true
  });
});

const getDocumentCookie = ClientFunction(() => {
  return document.cookie;
});

test("Test C14402: When ID migration is enabled and no legacy AMCV cookie is found, an AMCV cookie should be created", async () => {
  await apiCalls();
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );

  const payloads = createResponse(response).getPayloadsByType(
    "identity:result"
  );

  const ecidPayload = payloads.filter(
    payload => payload.namespace.code === "ECID"
  )[0];

  await t.expect(ecidPayload.id).match(ecidRegex);

  const documentCookie = await getDocumentCookie();

  await t
    .expect(documentCookie)
    .contains(
      `AMCV_53A16ACB5CC1D3760A495C99%40AdobeOrg=MCMID|${ecidPayload.id}`
    );
});
