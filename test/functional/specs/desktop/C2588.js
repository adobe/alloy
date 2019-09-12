import { t } from "testcafe";

const urlCollector = `http://127.0.0.1:8080/test/functional/sandbox/html/multiConfig.html`;

fixture`C2588`.page(urlCollector);

test.meta({
  ID: "C2588",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Throw error when configure is executed multiple times.", async () => {
  const message = await t.getBrowserConsoleMessages();
  await t
    .expect(message.error)
    .contains(
      "[alloy] Error: [alloy] The library has already been configured and may only be configured once."
    );
});
