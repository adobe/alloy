import { ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";
import testServerUrl from "../../helpers/constants/testServerUrl";

import { orgMainConfigMain } from "../../helpers/constants/configParts";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";

createFixture({
  title: "C2586: Toggle logging through the querystring parameter.",
  url: `${testServerUrl}?alloy_debug=true`
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
  await configureAlloyInstance("alloy", orgMainConfigMain);
  await getLibraryInfoCommand();

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log).match(/Executing getLibraryInfo command/);
});
