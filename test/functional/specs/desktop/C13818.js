import { RequestLogger, ClientFunction } from "testcafe";
import fixtureFactory from "../../helpers/fixtureFactory";
import testServerUrl from "../../helpers/constants/testServerUrl";
import baseConfig from "../../helpers/constants/baseConfig";
import alternateConfig from "../../helpers/constants/alternateConfig";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/alloySdk.html`;
const networkLoggerConfig = {
  logRequestBody: true,
  stringifyRequestBody: true
};
const networkLogger1 = RequestLogger(
  new RegExp(`v1\\/(interact|collect)\\?configId=${baseConfig.configId}`),
  networkLoggerConfig
);
const networkLogger2 = RequestLogger(
  new RegExp(`v1\\/(interact|collect)\\?configId=${alternateConfig.configId}`),
  networkLoggerConfig
);

fixtureFactory({
  title:
    "C13818: Changing the options object after configure doesn't change the computed config",
  url: urlCollector,
  requestHooks: [networkLogger1, networkLogger2]
});

test.meta({
  ID: "C13818",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const apiCalls = ClientFunction((configObject, alternateConfigObject) => {
  configObject.edgeBasePath = window.edgeBasePath;
  window.alloy("configure", configObject).then(() => {
    Object.keys(alternateConfigObject).forEach(key => {
      configObject[key] = alternateConfigObject[key];
    });
    window.alloy("event", { data: { key: "value" } });
  });
});

test("Test C13818: Changing the options object after configure doesn't change the computed config", async t => {
  await apiCalls(baseConfig, alternateConfig);

  await t.expect(networkLogger1.requests.length).eql(1);
  await t.expect(networkLogger2.requests.length).eql(0);
});
