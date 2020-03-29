import { ClientFunction } from "testcafe";
import fixtureFactory from "../helpers/fixtureFactory";
import testServer from "../helpers/constants/testServer";

import { orgMainConfigMain } from "../helpers/constants/configParts";
import configureAlloyInstance from "../helpers/configureAlloyInstance";

fixtureFactory({
  title: "C2586: Toggle logging through the querystring parameter.",
  url: `${testServer.domain}/${testServer.page}?alloy_debug=true`
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
