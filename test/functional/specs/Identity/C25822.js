import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  debugEnabled
);

createFixture({
  title: "C25822: Event command sends a request with a validated identityMap",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C25822",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("sendEvent", {
    xdm: {
      identityMap: {
        HYP: [
          {
            id: "id123"
          }
        ]
      }
    }
  });
});

test("C25822: Event command sends a request with a validated identityMap", async () => {
  await configureAlloyInstance("alloy", config);
  await triggerAlloyEvent();

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );

  await t.expect(request.events[0].xdm.identityMap.HYP[0].primary).eql(false);
  await t
    .expect(request.events[0].xdm.identityMap.HYP[0].authenticatedState)
    .eql("ambiguous");
});
