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
  "https://cataas.com/cat/cute",
  networkLoggerConfig
);

createFixture({
  title: "C31436 Qualify for URL destinations via XDM Data.",
  requestHooks: [networkLogger.edgeEndpointLogs, destinationLogger]
});

test.meta({
  ID: "C31436",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("sendEvent", {
    xdm: { web: { webPageDetails: { name: "C31436" } } }
  });
});

test("C31436 Qualify for URL destinations via XDM Data.", async () => {
  await configureAlloyInstance("alloy", orgMainConfigMain);
  await triggerAlloyEvent();

  await t.expect(destinationLogger.requests.length).eql(1);
});
