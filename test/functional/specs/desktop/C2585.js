import { Selector } from "testcafe";
import testServerUrl from "../../helpers/constants/testServerUrl";
import fixtureFactory from "../../helpers/fixtureFactory";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/alloySdk.html`;

fixtureFactory({
  title:
    "C2585: Throws error when configure is not the first command executed.",
  url: urlCollector
});

test.meta({
  ID: "C2585",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2585: Throw error when configure is not the first command executed.", async t => {
  // Note: unable to enable logging with url parameter or enabler logger config.

  await t.click(Selector("#logger-button"));
  await t.click(Selector("#event-button"));
  const { log } = await t.getBrowserConsoleMessages();

  await t
    .expect(log)
    .match(
      /The library must be configured first. Please do so by executing the configure command./
    );
});
