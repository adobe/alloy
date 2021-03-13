import { RequestLogger, RequestMock, t } from "testcafe";
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

const destinationRequestMock = RequestMock()
  .onRequestTo("https://cataas.com/cat/cute")
  .respond(null, 200);

createFixture({
  title: "C31436 Qualify for URL destinations via XDM Data.",
  requestHooks: [
    networkLogger.edgeEndpointLogs,
    destinationLogger,
    destinationRequestMock
  ]
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
