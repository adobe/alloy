import { t, Selector, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";
import baseConfig from "../../helpers/constants/baseConfig";
import addAnchorToBody from "../../helpers/dom/addAnchorToBody";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import createConsoleLogger from "../../helpers/consoleLogger";
import { compose } from "../../helpers/constants/configParts";

createFixture({
  title: "C8118: Send event with information about link clicks."
});

test.meta({
  ID: "C8118",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C8118: Load page with link. Click link. Verify event.", async () => {
  const getLocation = ClientFunction(() => document.location.href.toString());
  const testConfig = compose(
    baseConfig,
    {
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
  await addAnchorToBody({
    text: "Test Link",
    attributes: {
      href: "blank.html",
      id: "alloy-link-test"
    }
  });
  const logger = await createConsoleLogger();
  await t.click(Selector("#alloy-link-test"));
  await t.expect(getLocation()).contains("blank.html");
  await logger.log.expectMessageMatching(/blank\.html/);
});
