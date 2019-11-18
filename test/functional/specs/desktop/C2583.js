import { Selector } from "testcafe";

const urlCollector = `http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html`;

fixture`C2583`.page(urlCollector);

test.meta({
  ID: "C2583",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Set the log option to true. Load the page. Execute an event command.", async t => {
  await t.navigateTo(
    "http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html"
  );
  await t
    .click(Selector("#logenabled-button"))
    .click(Selector("#event-button"));

  const { log } = await t.getBrowserConsoleMessages();

  await t.expect(log).match(/\[alloy] Executing event command./);

  await t
    .click(Selector("#nologconfig-button"))
    .click(Selector("#event-button"));

  await t.expect(log).match(/\[alloy] Executing event command./);
});

test("Regression: Set the log option in the configuration to false. Refresh the browser. Execute an event command.", async t => {
  await t
    .click(Selector("#disablelog-button"))
    .click(Selector("#event-button"));

  const { log } = await t.getBrowserConsoleMessages();

  await t.expect(log).notContains("Executing event command.");

  await t
    .click(Selector("#nologconfig-button"))
    .click(Selector("#event-button"));

  await t.expect(log).notContains("Executing event command.");
});
