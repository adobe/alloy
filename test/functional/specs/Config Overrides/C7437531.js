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
const config = compose(orgMainConfigMain, debugEnabled);
const overrides = { com_adobe_identity: { idSyncContainerId: "1234" } };
const alternateOverrides = {
  com_adobe_identity: { idSyncContainerId: "5678" }
};

createFixture({
  title:
    "C7437531: `getIdentity` can receive config overrides in command options and in `configure`",
  requestHooks: [networkLogger.acquireEndpointLogs]
});

test.meta({
  ID: "C2592",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C7437531: `getIdentity` can receive config overrides in command options", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  // this should get an ECID
  await alloy.getIdentity({
    edgeConfigOverrides: overrides
  });

  await responseStatus(networkLogger.acquireEndpointLogs.requests, 200);
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.acquireEndpointLogs.requests[0].request.body
  );

  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql(overrides.com_adobe_identity.idSyncContainerId);
});

test("Test C7437531: `getIdentity` can receive config overrides from `configure`", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(compose(config, { edgeConfigOverrides: overrides }));
  // this should get an ECID
  await alloy.getIdentity();

  await responseStatus(networkLogger.acquireEndpointLogs.requests, 200);
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.acquireEndpointLogs.requests[0].request.body
  );

  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql(overrides.com_adobe_identity.idSyncContainerId);
});

test("Test C7437531: overrides from `getIdentity` should take precedence over the ones from `configure`", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(
    compose(config, { edgeConfigOverrides: alternateOverrides })
  );
  // this should get an ECID
  await alloy.getIdentity({ edgeConfigOverrides: overrides });

  await responseStatus(networkLogger.acquireEndpointLogs.requests, 200);
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.acquireEndpointLogs.requests[0].request.body
  );

  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql(overrides.com_adobe_identity.idSyncContainerId);
});

test("Test C7437531: empty configuration overrides should not be sent to the Edge", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  // this should get an ECID
  await alloy.getIdentity({
    edgeConfigOverrides: compose(overrides, {
      com_adobe_target: {
        propertyToken: ""
      }
    })
  });

  await responseStatus(networkLogger.acquireEndpointLogs.requests, 200);
  await t.expect(networkLogger.acquireEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.acquireEndpointLogs.requests[0].request.body
  );

  await t
    .expect(request.meta.configOverrides.com_adobe_identity.idSyncContainerId)
    .eql(overrides.com_adobe_identity.idSyncContainerId);

  await t.expect(request.meta.configOverrides.com_adobe_target).eql(undefined);
});
