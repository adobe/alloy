import { t } from "testcafe";

fixture`C2588`.page("http://127.0.0.1:8080/C2588.html");

const testDescription =
  "Regression: Throw error when configure is executed multiple times.";

test.meta({
  ID: "C2588",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
})(testDescription, async () => {
  const { error } = await t.getBrowserConsoleMessages();
  await t
    .expect(error)
    .ok([
      "[alloy] The library has already been configured and may only be configured once."
    ]);
});
