import { t, Selector, ClientFunction } from "testcafe";
import testServerUrl from "../../helpers/constants/testServerUrl";
import fixtureFactory from "../../helpers/fixtureFactory";
import baseConfig from "../../helpers/constants/baseConfig";
import addAnchorToBody from "../../helpers/dom/addAnchorToBody";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import createConsoleLogger from "../../helpers/consoleLogger";

const fixtureUrl = `${testServerUrl}/test/functional/sandbox/html/alloyTestPage.html`;

fixtureFactory({
  title: "C8118: Send event with information about link clicks.",
  url: fixtureUrl
});

test.meta({
  ID: "C8118",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C8118: Load page with link. Click link. Verify event.", async () => {
  const getLocation = ClientFunction(() => document.location.href.toString());
  const logger = createConsoleLogger(t, "log");
  const testConfig = {
    onBeforeEventSend(options) {
      try {
        // eslint-disable-next-line no-console
        console.log(options.xdm.web.webInteraction.URL);
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }
  };
  Object.assign(testConfig, baseConfig);
  await configureAlloyInstance("alloy", testConfig);
  await addAnchorToBody({
    text: "Test Link",
    attributes: {
      href: "blank.html",
      id: "alloy-link-test"
    }
  });
  await t.click(Selector("#alloy-link-test"));
  await t.expect(getLocation()).contains("blank.html");
  const newMessages = await logger.getNewMessages();
  const destinationUrl = newMessages[0];
  await t.expect(destinationUrl).contains("blank.html");
});
