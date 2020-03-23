import { t, ClientFunction, RequestMock } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import getResponseBody from "../helpers/networkLogger/getResponseBody";
import fixtureFactory from "../helpers/fixtureFactory";

import debugEnabledConfig from "../helpers/constants/debugEnabledConfig";
import configureAlloyInstance from "../helpers/configureAlloyInstance";

const networkLogger = createNetworkLogger();

const corsHeader = {
  "access-control-allow-credentials": true,
  "access-control-allow-origin": "https://alloyio.com"
};

const mockWithoutResponse = new RequestMock().onRequestTo(
  /v1\/interact\?configId=/
);

const mockWithIdentityCookie = new RequestMock()
  .onRequestTo(/v1\/interact\?configId=/)
  .respond(
    {
      requestId: "e9940618-20d7-4bb7-9348-793cbd56b670",
      handle: [
        {
          type: "state:store",
          payload: [
            {
              key: "kndctr_334F60F35E1597910A495EC2_AdobeOrg_identity",
              value: "CgoKA25ldxIBMBgACg8KBnN5bmNlZBIBMRi",
              maxAge: 34128000
            }
          ]
        }
      ]
    },
    200,
    corsHeader
  );

fixtureFactory({
  title: "C2581: Queue events when no ECID available on client",
  requestHooks: [
    networkLogger.edgeCollectEndpointLogs,
    networkLogger.edgeInteractEndpointLogs
  ]
});

test.meta({
  ID: "C2581",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvents = ClientFunction(() => {
  return new Promise(resolve => {
    window
      .alloy("event", { viewStart: true, data: { key: "value" } })
      .then(() => resolve());
    window.alloy("event", { data: { key: "value" } });
    window.alloy("event", { data: { key: "value" } });
  });
});

const identityCookieName = "kndctr_334F60F35E1597910A495EC2_AdobeOrg_identity";

test.requestHooks(mockWithoutResponse)(
  "Test C2581: Queue requests until we receive an ECID.",
  async () => {
    await configureAlloyInstance("alloy", debugEnabledConfig);

    await triggerAlloyEvents();

    await t
      .expect(networkLogger.edgeInteractEndpointLogs.requests.length)
      .eql(1);
  }
);

test.requestHooks(mockWithIdentityCookie)(
  "Test C2581: Request are triggered once ECID is available.",
  async () => {
    await configureAlloyInstance("alloy", debugEnabledConfig);
    await triggerAlloyEvents();

    const interactRequests = networkLogger.edgeInteractEndpointLogs.requests;

    await t.expect(interactRequests.length).eql(1);

    const responseBody = JSON.parse(getResponseBody(interactRequests[0]));

    const hasIdentityCookie =
      responseBody.handle[0].payload[0].key === identityCookieName;

    await t.expect(hasIdentityCookie).eql(true);
    // At this point, we should have received the identity and the other 2 requests
    // should have been unblocked.
    await t
      .expect(networkLogger.edgeCollectEndpointLogs.requests.length)
      .eql(2);
  }
);
