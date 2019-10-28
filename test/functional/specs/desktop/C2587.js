import { t } from "testcafe";
import testServerUrl from "../../src/constants/testServerUrl";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/bogusCommand.html`;

fixture`C2587`.page(urlCollector);

test.meta({
  ID: "C2587",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Regression: Throw error when executing command that doesn't exist", async () => {
  const message = await t.getBrowserConsoleMessages();
  await t
    .expect(message.error)
    .match(/\[alloy] Resolve these configuration problems:/);
});
