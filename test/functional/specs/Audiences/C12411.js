import { RequestLogger, t, ClientFunction } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";

const networkLogger = createNetworkLogger();

const networkLoggerConfig = {
  logRequestBody: true,
  stringifyRequestBody: true
};

const destinationLogger = RequestLogger(
  "https://cataas.com/cat",
  networkLoggerConfig
);

createFixture({
  title:
    "C12411 Response should return URL destinations if turned on in Blackbird",
  requestHooks: [networkLogger.edgeEndpointLogs, destinationLogger]
});

test.meta({
  ID: "C12411",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("sendEvent");
});

test("C12411 Response should return URL destinations if turned on in Blackbird", async () => {
  await configureAlloyInstance("alloy", orgMainConfigMain);
  await triggerAlloyEvent();

  await t.expect(destinationLogger.requests.length > 0).eql(true);
});
