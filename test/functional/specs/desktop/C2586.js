import { Selector } from "testcafe";

const urlCollector = `http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html?alloy_log=true`;

fixture`C2586`.page(urlCollector);

test.meta({
  ID: "C2586",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Toggle logging through the querystring parameter.", async t => {
  await t.click(Selector("#event-button"));
  const message = await t.getBrowserConsoleMessages();
  await t.expect(message.log).match(/The library must be configured first./);
});

test("Regression: Toggle logging through the querystring parameter.", async t => {
  await t
    .navigateTo(
      "http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html?alloy_log=false"
    )
    .click(Selector("#event-button"));
  const message = await t.getBrowserConsoleMessages();
  await t.expect(message.log).notMatch(/The library must be configured first./);
});
