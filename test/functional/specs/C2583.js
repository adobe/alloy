import { ClientFunction } from "testcafe";
import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";

import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  debugDisabled
} from "../helpers/constants/configParts";

const debugEnabledConfig = compose(
  orgMainConfigMain,
  debugEnabled
);

const debugDisabledConfig = compose(
  orgMainConfigMain,
  debugDisabled
);

fixtureFactory({
  title: "C2583: Toggle logging through configuration"
});

test.meta({
  ID: "C2583",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return new Promise(resolve => {
    window.alloy("sendEvent", { xdm: { key: "value" } }).then(() => resolve());
  });
});

test("Test C2583: Set the log option to true. Load the page. Execute a sendEvent command.", async t => {
  await configureAlloyInstance("alloy", debugEnabledConfig);

  await triggerAlloyEvent();

  const { log } = await t.getBrowserConsoleMessages();

  await t.expect(log).match(/\[alloy] Executing sendEvent command./);
});

test("Test C2583: Set the log option in the configuration to false. Refresh the browser. Execute a sendEvent command.", async t => {
  await configureAlloyInstance("alloy", debugDisabledConfig);
  await triggerAlloyEvent();

  const { log } = await t.getBrowserConsoleMessages();

  await t.expect(log).notContains("Executing sendEvent command.");

  await triggerAlloyEvent();

  await t.expect(log).notContains("Executing sendEvent command.");
});
