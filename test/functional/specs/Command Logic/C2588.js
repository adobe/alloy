import { ClientFunction } from "testcafe";
import fixtureFactory from "../../helpers/fixtureFactory";
import { orgMainConfigMain } from "../../helpers/constants/configParts";

fixtureFactory({
  title: "C2588: Throws error when configure is executed multiple times."
});

test.meta({
  ID: "C2588",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const configureAlloyInstance = ClientFunction(config => {
  return window
    .alloy("configure", config)
    .then(() => {}, error => error.message);
});

test("Test C2588: Throw error when configure is executed multiple times.", async t => {
  await configureAlloyInstance(orgMainConfigMain);
  const errorMessage = await configureAlloyInstance(orgMainConfigMain);

  await t
    .expect(errorMessage)
    .match(
      /The library has already been configured and may only be configured once./
    );
});
