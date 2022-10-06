import createFixture from "../../helpers/createFixture";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

createFixture({
  title: "C2588: Throws error when configure is executed multiple times."
});

test.meta({
  ID: "C2588",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C2588: Throw error when configure is executed multiple times.", async t => {
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  const errorMessage = await alloy.configureErrorMessage(orgMainConfigMain);

  await t
    .expect(errorMessage)
    .match(
      /The library has already been configured and may only be configured once./
    );
});
