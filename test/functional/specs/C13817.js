import fixtureFactory from "../helpers/fixtureFactory";

fixtureFactory({
  title: "C13817: Throws error when running command after bad configure"
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
      .alloy("sendEvent", { data: { key: "value" } })
      .then(() => undefined, e => e.message);
  });

  await t.expect(eventErrorMessage).contains("configured");
});
