import { ClientFunction } from "testcafe";
import fixtureFactory from "../../helpers/fixtureFactory";
import testServerUrl from "../../helpers/constants/testServerUrl";

import debugDisabledConfig from "../../helpers/constants/debugDisabledConfig";
import debugEnabledConfig from "../../helpers/constants/debugEnabledConfig";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";

fixtureFactory({
  title: "C2583: Toggle logging through configuration",
  url: `${testServerUrl}/alloyTestPage.html`
});

test.meta({
  ID: "C2583",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return new Promise(resolve => {
    window.alloy("event", { xdm: { key: "value" } }).then(() => resolve());
  });
});

test("Test C2583: Set the log option to true. Load the page. Execute an event command.", async t => {
  await configureAlloyInstance("alloy", debugEnabledConfig);

  await triggerAlloyEvent();

  const { log } = await t.getBrowserConsoleMessages();

  await t.expect(log).match(/\[alloy] Executing event command./);
});

test("Test C2583: Set the log option in the configuration to false. Refresh the browser. Execute an event command.", async t => {
  await configureAlloyInstance("alloy", debugDisabledConfig);
  await triggerAlloyEvent();

  const { log } = await t.getBrowserConsoleMessages();

  await t.expect(log).notContains("Executing event command.");

  await triggerAlloyEvent();

  await t.expect(log).notContains("Executing event command.");
});
