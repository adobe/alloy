import { t, Selector, ClientFunction } from "testcafe";
import fixtureFactory from "../../helpers/fixtureFactory";
import baseConfig from "../../helpers/constants/baseConfig";
import addAnchorToBody from "../../helpers/dom/addAnchorToBody";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import createConsoleLogger from "../../helpers/consoleLogger";
import { compose } from "../../helpers/constants/configParts";

fixtureFactory({
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
    baseConfig,
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
  await logger.log.expectNoMessages();
});
