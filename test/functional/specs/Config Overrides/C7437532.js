import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  consentIn
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, consentIn, debugEnabled);
const overrides = { identity: { idSyncContainerId: "1234" } };

createFixture({
  title:
    "C7437532: `appendIdentityToUrl` can receive config overrides in command options and in `configure`",
  requestHooks: [networkLogger.acquireEndpointLogs]
});

test.meta({
  ID: "C2592",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C7437532: `appendIdentityToUrl` can receive config overrides in command options", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  // this should get an ECID
  await alloy.appendIdentityToUrl({
    url: "https://example.com",
    configuration: overrides
  });

  await responseStatus(networkLogger.acquireEndpointLogs.requests, 200);
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.acquireEndpointLogs.requests[0].request.body
  );

  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql("1234");
});

test("Test C7437532: `appendIdentityToUrl` can receive config overrides from `configure`", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(compose(config, { configurationOverrides: overrides }));
  // this should get an ECID
  await alloy.appendIdentityToUrl({
    url: "https://example.com"
  });

  await responseStatus(networkLogger.acquireEndpointLogs.requests, 200);
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.acquireEndpointLogs.requests[0].request.body
  );

  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql("1234");
});
