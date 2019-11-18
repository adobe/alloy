import testServerUrl from "../../src/constants/testServerUrl";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/bogusCommand.html`;

fixture`C2587`.page(urlCollector);

test.meta({
  ID: "C2587",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Throw error when executing command that doesn't exist", async t => {
  await t.navigateTo(
    "http://127.0.0.1:8080/test/functional/sandbox/html/bogusCommand.html"
  );
  const { error } = await t.getBrowserConsoleMessages();
  await t.expect(error).match(/The boguscommand command does not exist./);
});
