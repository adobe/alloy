import { t, Selector } from "testcafe";
import testServerUrl from "../../src/constants/testServerUrl";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/alloySdk.html`;

fixture`C2585`.page(urlCollector);

test.meta({
  ID: "C2585",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Throw error when configure is not the first command executed.", async () => {
  await t.click(
    Selector("#body > section > div.left-nav > div > ul > li:nth-child(4) > a")
  );

  const message = await t.getBrowserConsoleMessages();

  await t
    .expect(message.log)
    .match(
      '[alloy] The library must be configured first. Please do so by calling alloy("configure", {...}).'
    );
});
