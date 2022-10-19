import { RequestLogger, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";

import {
  orgMainConfigMain,
  orgAltConfigAlt
} from "../../helpers/constants/configParts";

const networkLoggerConfig = {
  logRequestBody: true,
  stringifyRequestBody: true
};
const networkLogger1 = RequestLogger(
  new RegExp(
    `v1\\/(interact|collect)\\?configId=${orgMainConfigMain.edgeConfigId}`
  ),
  networkLoggerConfig
);
const networkLogger2 = RequestLogger(
  new RegExp(
    `v1\\/(interact|collect)\\?configId=${orgAltConfigAlt.edgeConfigId}`
  ),
  networkLoggerConfig
);

createFixture({
  title:
    "C13818: Changing the options object after configure doesn't change the computed config",
  requestHooks: [networkLogger1, networkLogger2]
});

test.meta({
  ID: "C13818",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const apiCalls = ClientFunction((configObject, alternateConfigObject) => {
  return window.alloy("configure", configObject).then(() => {
    Object.keys(alternateConfigObject).forEach(key => {
      configObject[key] = alternateConfigObject[key];
    });
    return window.alloy("sendEvent");
  });
});

test("C13818: Changing the options object after configure doesn't change the computed config", async t => {
  await apiCalls(orgMainConfigMain, orgAltConfigAlt);

  await t.expect(networkLogger1.requests.length).eql(1);
  await t.expect(networkLogger2.requests.length).eql(0);
});
