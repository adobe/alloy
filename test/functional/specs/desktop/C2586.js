import { Selector } from "testcafe";

const urlCollector = `http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html?alloy_debug=true`;

fixture`C2586: Toggle logging through the querystring parameter.`.page(
  urlCollector
);

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
    "http://127.0.0.1:8080/test/functional/sandbox/html/bogusCommand.html?alloy_debug=false"
  );
  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).lte(0);
});
