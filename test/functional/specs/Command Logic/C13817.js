import createAlloyProxy from "../../helpers/createAlloyProxy";
import createFixture from "../../helpers/createFixture";

createFixture({
  title: "C13817: Throws error when running command after bad configure"
});

test.meta({
  ID: "C13817",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C13817: Throws error when running command after bad configure", async t => {
  const alloy = createAlloyProxy();
  await alloy.configureErrorMessage();
  const eventErrorMessage = await alloy.sendEventErrorMessage();
  await t.expect(eventErrorMessage).contains("configured");
});
