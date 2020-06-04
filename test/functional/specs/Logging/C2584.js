import { ClientFunction } from "testcafe";
import createConsoleLogger from "../../helpers/consoleLogger";
import createFixture from "../../helpers/createFixture";
import testServerUrl from "../../helpers/constants/testServerUrl";
import baseConfig from "../../helpers/constants/baseConfig";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";

createFixture({
  title: "C2584: Toggle logging through setDebug command"
});

test.meta({
  ID: "C2584",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const debugCommand = ClientFunction(enabled => {
  return window.alloy("setDebug", { enabled });
});

const getLibraryInfoCommand = ClientFunction(() => {
  return window.alloy("getLibraryInfo");
});

test("Test C2584: setDebug command with enable: true. getLibraryInfo. refresh. toggle and repeat.", async t => {
  const logger = await createConsoleLogger();
  await configureAlloyInstance("alloy", baseConfig);

  await debugCommand(true);
  await getLibraryInfoCommand();
  await logger.info.expectMessageMatching(/Executing getLibraryInfo command/);

  await t.navigateTo(testServerUrl);
  await configureAlloyInstance("alloy", baseConfig);
  await debugCommand(false);
  await logger.reset();
  await getLibraryInfoCommand();

  await logger.info.expectNoMessages();
});
