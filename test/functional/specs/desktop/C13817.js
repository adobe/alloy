import fixtureFactory from "../../helpers/fixtureFactory";
import testServerUrl from "../../helpers/constants/testServerUrl";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/alloySdk.html`;

fixtureFactory({
  title: "C13817: Throws error when running command after bad configure",
  url: urlCollector
});

test.meta({
  ID: "C13817",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C13817: Throws error when running command after bad configure", async t => {
  const eventErrorMessage = await t.eval(() => {
    window.alloy("configure");
    return window
      .alloy("event", { data: { key: "value" } })
      .then(() => undefined, e => e.message);
  });

  await t.expect(eventErrorMessage).contains("configured");
});
