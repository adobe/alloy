import { t, Selector, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import createConsoleLogger from "../../helpers/consoleLogger";
import createUnhandledRejectionLogger from "../../helpers/createUnhandledRejectionLogger";
import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../helpers/constants/configParts";

const { CONSENT_OUT } = require("../../helpers/constants/consent");

createFixture({
  title: "C225010: Click collection handles errors when user declines consent"
});

test.meta({
  ID: "C8118",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C225010: Click collection handles errors when user declines consent", async () => {
  const getLocation = ClientFunction(() => document.location.href.toString());
  const testConfig = compose(
    orgMainConfigMain,
    consentPending,
    debugEnabled
  );
  await configureAlloyInstance("alloy", testConfig);
  await t.eval(
    () => {
      return window.alloy("setConsent", CONSENT_OUT);
    },
    { dependencies: { CONSENT_OUT } }
  );
  await addHtmlToBody(`<a id="alloy-link-test" href="#foo">Test Link</a>`);

  const consoleLogger = await createConsoleLogger();
  const unhandledRejectionLogger = await createUnhandledRejectionLogger();
  await t.click(Selector("#alloy-link-test"));
  await t.expect(getLocation()).contains("#foo");
  await consoleLogger.warn.expectMessageMatching(
    /The click collection could not fully complete because the user declined consent/
  );
  await unhandledRejectionLogger.expectNoMessageMatching(/.*/);
});
