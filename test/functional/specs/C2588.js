import fixtureFactory from "../helpers/fixtureFactory";
import debugEnabledConfig from "../helpers/constants/debugEnabledConfig";
import configureAlloyInstance from "../helpers/configureAlloyInstance";

fixtureFactory({
  title: "C2588: Throws error when configure is executed multiple times."
});

test.meta({
  ID: "C2588",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2588: Throw error when configure is executed multiple times.", async t => {
  await configureAlloyInstance("alloy", {
    errorsEnabled: false,
    ...debugEnabledConfig
  });

  await configureAlloyInstance("alloy", {
    errorsEnabled: false,
    ...debugEnabledConfig
  });

  const { error } = await t.getBrowserConsoleMessages();
  await t
    .expect(error)
    .match(
      /The library has already been configured and may only be configured once./
    );
});
