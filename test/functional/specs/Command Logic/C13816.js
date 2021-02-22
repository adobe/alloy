import createAlloyProxy from "../../helpers/createAlloyProxy";
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
  const alloy = createAlloyProxy();
  const configureErrorMessage = await alloy.configureErrorMessage();

  await t
    .expect(configureErrorMessage)
    .ok("Configure didn't throw an exception.");
  await t.expect(configureErrorMessage).contains("orgId");
  await t.expect(configureErrorMessage).contains("edgeConfigId");
  await t.expect(configureErrorMessage).contains("documentation");
});
