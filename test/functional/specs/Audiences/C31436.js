import { RequestLogger, t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

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

test.skip("C31436 Qualify for URL destinations via XDM Data.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  await alloy.sendEvent({
    xdm: { web: { webPageDetails: { name: "C31436" } } }
  });

  await t.expect(destinationLogger.requests.length).eql(1);
});
