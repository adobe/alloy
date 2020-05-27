import { ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";

import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";

const config = compose(
  orgMainConfigMain,
  debugEnabled
);

createFixture({
  title: "C2587: Throw error when executing command that doesn't exist."
});

test.meta({
  ID: "C2587",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const bogusCommand = ClientFunction(() => {
  return window.alloy("bogusCommand").then(() => {}, error => error.message);
});

test("Test C2587: Throw error when executing command that doesn't exist", async t => {
  await configureAlloyInstance("alloy", config);
  const errorMessage = await bogusCommand();
  await t
    .expect(errorMessage)
    .match(/The bogusCommand command does not exist./);
});
