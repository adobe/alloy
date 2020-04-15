import { ClientFunction } from "testcafe";
import fixtureFactory from "../helpers/fixtureFactory";

import configureAlloyInstance from "../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  errorsDisabled
} from "../helpers/constants/configParts";

const config = compose(
  orgMainConfigMain,
  debugEnabled,
  errorsDisabled
);

fixtureFactory({
  title: "C2587: Throw error when executing command that doesn't exist."
});

test.meta({
  ID: "C2587",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const bogusCommand = ClientFunction(() => {
  window.alloy("bogusCommand");
});

test.before(async () => {
  await configureAlloyInstance("alloy", config);
  await bogusCommand();
})(
  "Test C2587: Throw error when executing command that doesn't exist",
  async t => {
    const { error } = await t.getBrowserConsoleMessages();
    await t.expect(error).match(/The bogusCommand command does not exist./);
  }
);
