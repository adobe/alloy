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

// This test is skipped because there's a bug in TestCafe where the request logger doesn't
// log the request of the URL destination image if the image is loaded inside an iframe.
// The image is loaded inside an iframe because hideReferrer is set to true for the
// URL destination. We could fix this test by setting hideReferrer to false so that
// the image is loaded outside an iframe, but there seems to be another bug at or
// behind Konductor preventing us from doing so.
// https://github.com/DevExpress/testcafe/issues/6060
// https://jira.corp.adobe.com/browse/PDCL-4709
test.skip("C31436 Qualify for URL destinations via XDM Data.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  await alloy.sendEvent({
    xdm: { web: { webPageDetails: { name: "C31436" } } }
  });

  await t.expect(destinationLogger.requests.length).eql(1);
});
