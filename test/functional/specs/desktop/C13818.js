import { RequestLogger } from "testcafe";
import fixtureFactory from "../../helpers/fixtureFactory";
import testServerUrl from "../../helpers/constants/testServerUrl";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/alloySdk.html`;
const networkLoggerConfig = {
  logRequestBody: true,
  stringifyRequestBody: true
};
const networkLogger1 = RequestLogger(
  /v1\/(interact|collect)\?configId=9999999/,
  networkLoggerConfig
);
const networkLogger2 = RequestLogger(
  /v1\/(interact|collect)\?configId=8888888/,
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

test("Test C13818: Changing the config object after calling configure doesn't change the computed config", async t => {
  await t.eval(() => {
    const configObject = {
      configId: "9999999",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
      edgeBasePath: window.edgeBasePath,
      idMigrationEnabled: false
    };
    window.alloy("configure", configObject).then(() => {
      configObject.configId = "8888888";
      configObject.orgId = "97D1F3F459CE0AD80A495CBE@AdobeOrg";
      window.alloy("event", { data: { key: "value" } });
    });
  });

  await t.expect(networkLogger1.requests.length).eql(1);
  await t.expect(networkLogger2.requests.length).eql(0);
});
