import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import getResponseBody from "../helpers/networkLogger/getResponseBody";
import { responseStatus } from "../helpers/assertions";
import fixtureFactory from "../helpers/fixtureFactory";
import createResponse from "../../../src/core/createResponse";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title:
    "C14394: When ID migration is enabled and no identity cookie is found but legacy AMCV cookie is found, the ECID will be sent on the request",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14394",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const apiCalls = ClientFunction(() => {
  document.cookie =
    "AMCV_53A16ACB5CC1D3760A495C99%40AdobeOrg=77933605%7CMCIDTS%7C18290%7CMCMID%7C16908443662402872073525706953453086963%7CMCAAMLH-1580857889%7C9%7CMCAAMB-1580857889%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1580260289s%7CNONE%7CvVersion%7C4.5.1";

  window.alloy("configure", {
    configId: "9999999",
    orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
    edgeBasePath: window.edgeBasePath,
    debugEnabled: true,
    idMigrationEnabled: true
  });

  return window.alloy("event", {
    viewStart: true,
    xdm: {
      device: {
        screenHeight: 1
      }
    }
  });
});

test("Test C14394: When ID migration is enabled and no identity cookie is found but legacy AMCV cookie is found, the ECID will be sent on the request", async () => {
  await apiCalls();
  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );

  await t
    .expect(request.xdm.identityMap.ECID[0].id)
    .eql("16908443662402872073525706953453086963");

  const response = JSON.parse(
    getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  );

  const payloads = createResponse(response).getPayloadsByType(
    "identity:result"
  );

  const ecidPayload = payloads.filter(
    payload => payload.namespace.code === "ECID"
  )[0];

  await t.expect(ecidPayload.id).eql("16908443662402872073525706953453086963");
});
