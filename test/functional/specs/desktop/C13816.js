import fixtureFactory from "../../helpers/fixtureFactory";
import testServerUrl from "../../helpers/constants/testServerUrl";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/alloySdk.html`;

fixtureFactory({
  title: "C13816: Throws error when configure has no options",
  url: urlCollector
});

test.meta({
  ID: "C13816",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C13816: Throws error when configure has no options", async t => {
  const configureErrorMessage = await t.eval(() => {
    return window.alloy("configure").then(() => undefined, e => e.message);
  });

  await t
    .expect(configureErrorMessage)
    .ok("Configure didn't throw an exception.");
  await t.expect(configureErrorMessage).match(/orgId/);
  await t.expect(configureErrorMessage).match(/configId/);
  await t.expect(configureErrorMessage).match(/documentation/);
});
