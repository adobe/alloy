import { ClientFunction } from "testcafe";
import fixtureFactory from "../helpers/fixtureFactory";
import testServerUrl from "../helpers/constants/testServerUrl";

import baseConfig from "../helpers/constants/baseConfig";
import configureAlloyInstance from "../helpers/configureAlloyInstance";

fixtureFactory({
  title: "C2586: Toggle logging through the querystring parameter.",
  url: `${testServerUrl}/alloyTestPage.html?alloy_debug=true`
});

test.meta({
  ID: "C2586",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const getLibraryInfoCommand = ClientFunction(() => {
  return new Promise(resolve => {
    window.alloy("getLibraryInfo").then(() => resolve());
  });
});

test("Test C2586: Toggle logging through the querystring parameter.", async t => {
  await configureAlloyInstance("alloy", baseConfig);
  await getLibraryInfoCommand();

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log).match(/Executing getLibraryInfo command/);
});
