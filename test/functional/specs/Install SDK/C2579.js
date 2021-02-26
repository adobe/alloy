import { RequestLogger, t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  orgAltConfigAlt,
  debugEnabled,
  migrationDisabled
} from "../../helpers/constants/configParts";
import EDGE_CONFIG_ID from "../../helpers/constants/edgeConfigId";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const mainConfig = compose(
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled
);
const altConfig = compose(
  orgAltConfigAlt,
  debugEnabled,
  migrationDisabled
);

const networkLoggerConfig = {
  logRequestBody: true,
  stringifyRequestBody: true
};
const networkLogger1 = RequestLogger(
  /v1\/(interact|collect)\?configId=9999999/,
  networkLoggerConfig
);

const networkLogger2 = RequestLogger(
  new RegExp(`v1\\/(interact|collect)\\?configId=${EDGE_CONFIG_ID}`),
  networkLoggerConfig
);

createFixture({
  title: "C2579: Isolates multiple SDK instances",
  requestHooks: [networkLogger1, networkLogger2]
});

test.meta({
  ID: "C2579",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getIdentityCookieValue = request => {
  const payload = JSON.parse(request.request.body);
  if (!payload.meta.state.entries) {
    return undefined;
  }
  const identityEntry = payload.meta.state.entries.find(entry =>
    entry.key.includes("_identity")
  );
  return identityEntry.value;
};

test("Test C2579: Separate ECIDs are used for multiple SDK instances.", async () => {
  const instance1 = createAlloyProxy();
  const instance2 = createAlloyProxy("instance2");
  await instance1.configure(altConfig);
  await instance2.configure(mainConfig);
  await instance1.sendEvent();
  await instance2.sendEvent();
  await instance1.sendEvent();
  await instance2.sendEvent();

  await t.expect(networkLogger1.requests.length).eql(2);
  await t.expect(networkLogger2.requests.length).eql(2);
  const id1a = getIdentityCookieValue(networkLogger1.requests[0]);
  const id1b = getIdentityCookieValue(networkLogger1.requests[1]);
  const id2a = getIdentityCookieValue(networkLogger2.requests[0]);
  const id2b = getIdentityCookieValue(networkLogger2.requests[1]);

  await t.expect(id1a).eql(undefined);
  await t.expect(id1b).notEql(undefined);
  await t.expect(id2a).eql(undefined);
  await t.expect(id2b).notEql(undefined);
  await t.expect(id1b).notEql(id2b);
});
