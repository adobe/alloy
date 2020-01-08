import { Selector } from "testcafe";
import fixtureFactory from "../../helpers/fixtureFactory";

const urlCollector = `http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html`;

fixtureFactory({
  title: "C2583: Toggle logging through configuration",
  url: urlCollector
});

test.meta({
  ID: "C2583",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2583: Set the log option to true. Load the page. Execute an event command.", async t => {
  await t
    .click(Selector("#debugEnabled-button"))
    .click(Selector("#event-button"));

  const { log } = await t.getBrowserConsoleMessages();

  await t.expect(log).match(/\[alloy] Executing event command./);

  await t
    .click(Selector("#nologconfig-button"))
    .click(Selector("#event-button"));

  await t.expect(log).match(/\[alloy] Executing event command./);
});

test("Test C2583: Set the log option in the configuration to false. Refresh the browser. Execute an event command.", async t => {
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
