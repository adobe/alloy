import { t } from "testcafe";
import testServerUrl from "../../src/constants/testServerUrl";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/multiConfig.html`;

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
    .match(
      /The library has already been configured and may only be configured once./
    );
});
