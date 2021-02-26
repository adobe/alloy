import { ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

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
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  const errorMessage = await bogusCommand();
  await t
    .expect(errorMessage)
    .match(/The bogusCommand command does not exist./);
});
