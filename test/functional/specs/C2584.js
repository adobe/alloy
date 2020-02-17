import { ClientFunction } from "testcafe";
import createConsoleLogger from "../helpers/consoleLogger";
import fixtureFactory from "../helpers/fixtureFactory";
import testServerUrl from "../helpers/constants/testServerUrl";
import baseConfig from "../helpers/constants/baseConfig";
import configureAlloyInstance from "../helpers/configureAlloyInstance";

const url = `${testServerUrl}/alloyTestPage.html`;

fixtureFactory({
  title: "C2584: Toggle logging through debug command"
});

test.meta({
  ID: "C2584",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const debugCommand = ClientFunction(enabled => {
  return window.alloy("debug", { enabled });
});

const getLibraryInfoCommand = ClientFunction(() => {
  return window.alloy("getLibraryInfo");
});

test("Test C2584: debug command with enable: true. getLibraryInfo. refresh. toggle and repeat.", async t => {
  const logger = createConsoleLogger(t, "log");
  await configureAlloyInstance("alloy", baseConfig);

  await debugCommand(true);
  await getLibraryInfoCommand();

  const newMessages = await logger.getNewMessages();
  await t.expect(newMessages).match(/Executing getLibraryInfo command/);

  await t.navigateTo(url);
  await configureAlloyInstance("alloy", baseConfig);
  await debugCommand(false);
  await getLibraryInfoCommand();

  const messagesAfterRefresh = await logger.getNewMessages();

  await t
    .expect(messagesAfterRefresh)
    .notMatch(/\[alloy] Executing getLibraryInfo command./);
});
