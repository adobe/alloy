import { t, ClientFunction, RequestLogger } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import testPageUrl from "../../helpers/constants/testPageUrl";

const networkLogger = createNetworkLogger();

const redirectLogger = RequestLogger(
  "https://alloyio.com/functional-test/alloyTestPage.html?redirectedTest=true"
);

const config = compose(
  orgMainConfigMain,
  debugEnabled
);
createFixture({
  title:
    "C205528 A redirect offer should redirect the page to the URL in the redirect decision",
  url: `${testPageUrl}?test=C205528`,
  requestHooks: [networkLogger.edgeEndpointLogs, redirectLogger]
});

test.meta({
  ID: "C205528",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return new Promise(resolve => {
    window
      .alloy("sendEvent", {
        renderDecisions: true
      })
      .then(result => {
        resolve(result);
      });
  });
});

test("Test C205528: A redirect offer should redirect the page to the URL in the redirect decision", async () => {
  await configureAlloyInstance("alloy", config);
  try {
    await triggerAlloyEvent();
  } catch (e) {
    await t.expect(redirectLogger.requests.length).eql(1);
  }
});
