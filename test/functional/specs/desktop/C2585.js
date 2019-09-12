import { t } from "testcafe";

const urlCollector = `http://127.0.0.1:8080/test/functional/sandbox/html/pageEvent.html`;

fixture`C2585`.page(urlCollector);

test.meta({
  ID: "C2585",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Throw error when configure is not the first command executed.", async () => {
  const message = await t.getBrowserConsoleMessages();
  await t
    .expect(message.error)
    .contains(
      '[alloy] Error: [alloy] The library must be configured first. Please do so by calling alloy("configure", {...}).'
    );
});
