import { t } from "testcafe";

const urlCollector = `http://127.0.0.1:8080/test/functional/sandbox/html/bogusCommand.${
  process.env.baseurl
}.html`;

fixture`C2587`.page(urlCollector);

test.meta({
  ID: "C2587",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Throw error when executing command that doesn't exist", async () => {
  const message = await t.getBrowserConsoleMessages();
  await t
    .expect(message.warn[0])
    .eql(
      "[alloy] An error during configuration is preventing the boguscommand command from executing."
    );
});
