import createFixture from "../../helpers/createFixture";

createFixture({
  title: "C13816: Throws error when configure has no options"
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
  await t.expect(configureErrorMessage).contains("orgId");
  await t.expect(configureErrorMessage).contains("edgeConfigId");
  await t.expect(configureErrorMessage).contains("documentation");
});
