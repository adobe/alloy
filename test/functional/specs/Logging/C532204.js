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
    const origConsoleMethod = console[methodName];
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
