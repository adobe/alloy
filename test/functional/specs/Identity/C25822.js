import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

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

const badAlloyEventOptions = {
  xdm: {
    identityMap: {
      HYP: [
        {
          id: 123
        }
      ]
    }
  }
};

test("C25822: Event command validates the identityMap", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const errorMessage = await alloy.sendEventErrorMessage(badAlloyEventOptions);
  await t
    .expect(errorMessage)
    .ok("Expected the sendEvent command to be rejected");

  await t.expect(errorMessage).contains("xdm.identityMap.HYP[0].id");
});

const goodAlloyEventOptions = {
  xdm: {
    identityMap: {
      HYP: [
        {
          id: "id123"
        }
      ]
    }
  }
};

test("C25822: Event command sends the identityMap", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent(goodAlloyEventOptions);

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );

  await t.expect(request.events[0].xdm.identityMap).eql({
    HYP: [
      {
        id: "id123"
      }
    ]
  });
});
