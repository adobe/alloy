import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title:
    "C11001566: A display notification is sent when propositions are included in the sendEvent command",
  url: `${TEST_PAGE_URL}?test=C11001566`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C11001566",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C11001566: A display notification is sent when propositions are included in the sendEvent command", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({
    propositions: [
      {
        id: "C11001566",
        scope: "myscope",
        scopeDetails: {
          type: "test"
        }
      }
    ]
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const sendEventRequest = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(sendEventRequest.request.body);
  await t.expect(requestBody.events[0].xdm._experience.decisioning).eql({
    propositionEventType: {
      display: 1
    },
    propositions: [
      {
        id: "C11001566",
        scope: "myscope",
        scopeDetails: {
          type: "test"
        }
      }
    ]
  });
});
