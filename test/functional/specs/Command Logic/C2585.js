import createAlloyProxy from "../../helpers/createAlloyProxy";
import createFixture from "../../helpers/createFixture";

createFixture({
  title: "C2585: Throws error when configure is not the first command executed."
});

test.meta({
  ID: "C2585",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C2585: Throw error when configure is not the first command executed.", async t => {
  // Note: unable to enable logging with url parameter or enabler logger config.
  const alloy = createAlloyProxy();
  const sendEventErrorMessage = await alloy.sendEventErrorMessage();
  await t
    .expect(sendEventErrorMessage)
    .match(
      /The library must be configured first. Please do so by executing the configure command./
    );
});
