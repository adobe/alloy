import { t, Selector, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import createConsoleLogger from "../../helpers/consoleLogger";
import {
  compose,
  orgMainConfigMain
} from "../../helpers/constants/configParts";

createFixture({
  title:
    "C8119: Does not send event with information about link clicks if disabled."
});

test.meta({
  ID: "C8119",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C8119: Load page with link. Click link. Verify no event sent.", async () => {
  const getLocation = ClientFunction(() => document.location.href.toString());
  const testConfig = compose(
    orgMainConfigMain,
    {
      clickCollectionEnabled: false,
      onBeforeEventSend(options) {
        try {
          // eslint-disable-next-line no-console
          console.log(options.xdm.web.webInteraction.URL);
          // eslint-disable-next-line no-empty
        } catch (e) {}
      }
    }
  );
  await configureAlloyInstance("alloy", testConfig);
  await addHtmlToBody(
    `<a id="alloy-link-test" href="blank.html">Test Link</a>`
  );

  const logger = await createConsoleLogger();
  await t.click(Selector("#alloy-link-test"));
  await t.expect(getLocation()).contains("blank.html");
  await logger.log.expectNoMessages();
});
