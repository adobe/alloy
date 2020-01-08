import { Selector } from "testcafe";
import fixtureFactory from "../../helpers/fixtureFactory";
import testServerUrl from "../../helpers/constants/testServerUrl";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/alloySdk.html?alloy_debug=true`;

fixtureFactory({
  title: "C2586: Toggle logging through the querystring parameter.",
  url: urlCollector
});

test.meta({
  ID: "C2586",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2586: Toggle logging through the querystring parameter.", async t => {
  await t.click(Selector("#event-button"));
  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log).match(/The library must be configured first./);
});

test("Test C2586: Set logging to false through querystring parameter..", async t => {
  await t.navigateTo(
    `${testServerUrl}/test/functional/sandbox/html/bogusCommand.html?alloy_debug=false`
  );
  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).lte(0);
});
