import { ClientFunction } from "testcafe";
import createConsoleLogger from "../../helpers/consoleLogger";
import createFixture from "../../helpers/createFixture";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import reloadPage from "../../helpers/reloadPage";

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

test("Test C2584: setDebug command with enable: true. getLibraryInfo. refresh. toggle and repeat.", async () => {
  const logger = await createConsoleLogger();
  await configureAlloyInstance("alloy", orgMainConfigMain);

  await debugCommand(true);
  await getLibraryInfoCommand();
  await logger.info.expectMessageMatching(/Executing getLibraryInfo command/);

  await reloadPage();
  await configureAlloyInstance("alloy", orgMainConfigMain);
  await debugCommand(false);
  await logger.reset();
  await getLibraryInfoCommand();

  await logger.info.expectNoMessages();
});
