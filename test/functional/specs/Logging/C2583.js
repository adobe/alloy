import { ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";

import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  debugDisabled
} from "../../helpers/constants/configParts";

const debugEnabledConfig = compose(
  orgMainConfigMain,
  debugEnabled
);

const debugDisabledConfig = compose(
  orgMainConfigMain,
  debugDisabled
);

createFixture({
  title: "C2583: Toggle logging through configuration"
});

test.meta({
  ID: "C2583",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("sendEvent");
});

test("Test C2583: Set the log option to true. Load the page. Execute a sendEvent command.", async t => {
  await configureAlloyInstance("alloy", debugEnabledConfig);

  await triggerAlloyEvent();

  const { info } = await t.getBrowserConsoleMessages();

  await t.expect(info).match(/\[alloy] Executing sendEvent command./);
});

test("Test C2583: Set the log option in the configuration to false. Refresh the browser. Execute a sendEvent command.", async t => {
  await configureAlloyInstance("alloy", debugDisabledConfig);
  await triggerAlloyEvent();

  const { info } = await t.getBrowserConsoleMessages();

  await t.expect(info).notContains("Executing sendEvent command.");

  await triggerAlloyEvent();

  await t.expect(info).notContains("Executing sendEvent command.");
});
