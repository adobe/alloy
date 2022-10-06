import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  debugDisabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const debugEnabledConfig = compose(orgMainConfigMain, debugEnabled);

const debugDisabledConfig = compose(orgMainConfigMain, debugDisabled);

createFixture({
  title: "C2583: Toggle logging through configuration"
});

test.meta({
  ID: "C2583",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C2583: Set the log option to true. Load the page. Execute a sendEvent command.", async t => {
  const alloy = createAlloyProxy();
  await alloy.configure(debugEnabledConfig);
  await alloy.sendEvent();

  const { info } = await t.getBrowserConsoleMessages();

  await t.expect(info).match(/\[alloy] Executing sendEvent command./);
});

test("C2583: Set the log option in the configuration to false. Refresh the browser. Execute a sendEvent command.", async t => {
  const alloy = createAlloyProxy();
  await alloy.configure(debugDisabledConfig);
  await alloy.sendEvent();

  const { info } = await t.getBrowserConsoleMessages();

  await t.expect(info).notContains("Executing sendEvent command.");

  await alloy.sendEvent();

  await t.expect(info).notContains("Executing sendEvent command.");
});
