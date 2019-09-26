import { t, Selector } from "testcafe";

const urlCollector = `http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html`;

fixture`C2583`.page(urlCollector);

test.meta({
  ID: "C2583",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Set the log option to true. Load the page. Execute an event command.", async () => {
  await t
    .click(Selector("#logenabled-button"))
    .click(Selector("#event-button"));

  const message = await t.getBrowserConsoleMessages();

  await t.expect(message.log).match(/\[alloy] Executing event command./);

  await t
    .click(Selector("#nologconfig-button"))
    .click(Selector("#event-button"));

  const message2 = await t.getBrowserConsoleMessages();

  await t.expect(message2.log).match(/\[alloy] Executing event command./);
});

test("Regression: Set the log option in the configuration to false. Refresh the browser. Execute an event command.", async () => {
  await t
    .click(Selector("#disablelog-button"))
    .click(Selector("#event-button"));

  const message = await t.getBrowserConsoleMessages();

  await t.expect(message.log).notContains("Executing event command.");

  await t
    .click(Selector("#nologconfig-button"))
    .click(Selector("#event-button"));

  const message2 = await t.getBrowserConsoleMessages();

  await t.expect(message2.log).notContains("Executing event command.");
});
