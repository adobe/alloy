import { t, Selector } from "testcafe";

const urlCollector = `http://127.0.0.1:8080/test/functional/sandbox/html/alloySdk.html`;

fixture`C2583`.page(urlCollector);

test.meta({
  ID: "C2583",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Toggle logging through configuration.", async () => {
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
