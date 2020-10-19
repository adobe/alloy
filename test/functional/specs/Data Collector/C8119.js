import { t, Selector, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody";
import createNetworkLogger from "../../helpers/networkLogger";

import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain
} from "../../helpers/constants/configParts";

const networkLogger = createNetworkLogger();

createFixture({
  title:
    "C8119: Does not send event with information about link clicks if disabled.",
  requestHooks: [networkLogger.edgeCollectEndpointLogs]
});

test.meta({
  ID: "C8119",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getLocation = ClientFunction(() => document.location.href.toString());

test("Test C8119: Load page with link. Click link. Verify no event sent.", async () => {
  const testConfig = compose(
    orgMainConfigMain,
    {
      clickCollectionEnabled: false
    }
  );
  await configureAlloyInstance("alloy", testConfig);
  await addHtmlToBody(
    `<a id="alloy-link-test" href="blank.html">Test Link</a>`
  );

  await t.click(Selector("#alloy-link-test"));
  await t.expect(getLocation()).contains("blank.html");
  await t.expect(networkLogger.edgeCollectEndpointLogs.requests.length).eql(0);
});
