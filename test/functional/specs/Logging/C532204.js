import { ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";

const debugEnabledConfig = compose(
  orgMainConfigMain,
  debugEnabled
);

/*
 * Some pages will redefine the console logging methods with implementations
 * that aren't as forgiving as the built in logger. We ran into this issue
 * on a Shopify site with a redefined logger. This test runs through some basic
 * scenarios and makes sure the logged objects can be stringified
 */
createFixture({
  title: "C532204: Logged objects can be stringified"
});

test.meta({
  ID: "C532204",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const setupLogger = ClientFunction(() => {
  ["log", "info", "warn", "error"].forEach(methodName => {
    // eslint-disable-next-line no-console
    const origConsoleMethod = console[methodName];
    // eslint-disable-next-line no-console
    console[methodName] = (...args) => {
      args.forEach(arg => {
        String(arg);
      });
      origConsoleMethod.apply(console, args);
    };
  });
});

const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("sendEvent");
});

test("Test C532204: Logged objects can be stringified", async () => {
  await setupLogger();
  await configureAlloyInstance("alloy", debugEnabledConfig);
  await triggerAlloyEvent();
});
