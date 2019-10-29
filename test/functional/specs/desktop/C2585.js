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
  // Note: unable to enable logging with url parameter or enabler logger config.

  await t.click(Selector("#logger-button"));
  await t.click(Selector("#event-button"));
  const message = await t.getBrowserConsoleMessages();

  await t
    .expect(message.log)
    .match(
      /The library must be configured first. Please do so by executing the configure command./
    );
});
