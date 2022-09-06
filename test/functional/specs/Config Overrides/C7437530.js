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
const overrides = {
  experience_platform: {
    datasets: {
      event: "5eb9aaa6a3b16e18a818e06f"
    }
  }
};

createFixture({
  title:
    "C7437530: sendEvent can receive config overrides in command options and in configure",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2592",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C7437530: sendEvent can receive config overrides in command options", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({
    configuration: overrides
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );

  await t
    .expect(request.events[0].xdm.implementationDetails.name)
    .eql("https://ns.adobe.com/experience/alloy");
  await t
    .expect(
      request.meta.configOverrides.com_adobe_experience_platform.datasets.event
    )
    .eql("5eb9aaa6a3b16e18a818e06f");
  await t.expect(request.meta.state.cookiesEnabled).eql(true);
  await t.expect(request.meta.state.domain).ok();
});

test("Test C7437530: sendEvent can receive config overrides from configure", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(
    compose(config, {
      configurationOverrides: overrides
    })
  );
  await alloy.sendEvent({});

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );
  // const response = JSON.parse(
  //   getResponseBody(networkLogger.edgeEndpointLogs.requests[0])
  // );
  // console.log(JSON.stringify(response, null, 2));

  await t
    .expect(request.events[0].xdm.implementationDetails.name)
    .eql("https://ns.adobe.com/experience/alloy");
  await t
    .expect(
      request.meta.configOverrides.com_adobe_experience_platform.datasets.event
    )
    .eql("5eb9aaa6a3b16e18a818e06f");
  await t.expect(request.meta.state.cookiesEnabled).eql(true);
  await t.expect(request.meta.state.domain).ok();
});
