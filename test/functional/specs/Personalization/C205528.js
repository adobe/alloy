import { t, RequestLogger } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();
const redirectEndpoint = /functional-test\/alloyTestPage.html\?redirectedTest=true/;

const redirectLogger = RequestLogger(redirectEndpoint);

const config = compose(orgMainConfigMain, debugEnabled);
createFixture({
  title:
    "C205528 A redirect offer should redirect the page to the URL in the redirect decision",
  url: `${TEST_PAGE_URL}?test=C205528`,
  requestHooks: [networkLogger.edgeEndpointLogs, redirectLogger]
});

test.meta({
  ID: "C205528",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C205528: A redirect offer should redirect the page to the URL in the redirect decision", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  try {
    await alloy.sendEvent({
      renderDecisions: true
    }).then(result => console.log(result));
  } catch (e) {
    // an exception will be thrown because a redirect will be executed within the Alloy Client Function
  } finally {
    await t.expect(redirectLogger.requests.length).eql(1);
  }
});
