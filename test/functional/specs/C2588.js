import fixtureFactory from "../helpers/fixtureFactory";
import configureAlloyInstance from "../helpers/configureAlloyInstance";
import {
  compose,
  errorsDisabled,
  debugEnabled,
  orgMainConfigMain
} from "../helpers/constants/configParts";

const config = compose(
  orgMainConfigMain,
  errorsDisabled,
  debugEnabled
);

fixtureFactory({
  title: "C2588: Throws error when configure is executed multiple times."
});

test.meta({
  ID: "C2588",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2588: Throw error when configure is executed multiple times.", async t => {
  await configureAlloyInstance("alloy", config);

  await configureAlloyInstance("alloy", config);

  const { error } = await t.getBrowserConsoleMessages();
  await t
    .expect(error)
    .match(
      /The library has already been configured and may only be configured once./
    );
});
