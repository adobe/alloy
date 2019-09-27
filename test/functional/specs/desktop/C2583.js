import { t, Selector } from "testcafe";
import testServerUrl from "../../src/constants/testServerUrl";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/alloySdk.html`;

fixture`C2583`.page(urlCollector);

test.meta({
  ID: "C2583",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Set the log option to true. Load the page. Execute an event command.", async () => {
  await t
    .click(
      Selector(
        "#body > section > div.left-nav > div > ul > li:nth-child(1) > a"
      )
    )
    .click(
      Selector(
        "#body > section > div.left-nav > div > ul > li:nth-child(4) > a"
      )
    );

  const message = await t.getBrowserConsoleMessages();

  await t.expect(message.log).match(/\[alloy] Executing event command./);

  // Remove the log option from the configuration. Refresh the browser. Execute an event command.
  await t
    .click(
      Selector(
        "#body > section > div.left-nav > div > ul > li:nth-child(2) > a"
      )
    )
    .click(
      Selector(
        "#body > section > div.left-nav > div > ul > li:nth-child(4) > a"
      )
    );

  const message2 = await t.getBrowserConsoleMessages();

  await t
    .expect(message2.log)
    .match(/Config nologconfig initiated./)
    .expect(message2.log)
    .match(/Config event initiated./)
    .expect(message2.log)
    .match(/\[alloy] Executing event command./);
});

test("Regression: Set the log option in the configuration to false. Refresh the browser. Execute an event command.", async () => {
  await t
    .click(
      Selector(
        "#body > section > div.left-nav > div > ul > li:nth-child(3) > a"
      )
    )
    .click(
      Selector(
        "#body > section > div.left-nav > div > ul > li:nth-child(4) > a"
      )
    );

  const message = await t.getBrowserConsoleMessages();

  await t.expect(message.log).notContains("Executing event command.");

  // Remove the log option from the configuration. Refresh the browser. Execute an event command.
  await t
    .click(
      Selector(
        "#body > section > div.left-nav > div > ul > li:nth-child(2) > a"
      )
    )
    .click(
      Selector(
        "#body > section > div.left-nav > div > ul > li:nth-child(4) > a"
      )
    );

  const message2 = await t.getBrowserConsoleMessages();

  await t.expect(message2.log).notContains("Executing event command.");
});
