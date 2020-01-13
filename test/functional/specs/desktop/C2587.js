import testServerUrl from "../../helpers/constants/testServerUrl";
import fixtureFactory from "../../helpers/fixtureFactory";

const urlCollector = `${testServerUrl}/test/functional/sandbox/html/bogusCommand.html`;

fixtureFactory({
  title: "C2587: Throw error when executing command that doesn't exist.",
  url: urlCollector
});

test.meta({
  ID: "C2587",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2587: Throw error when executing command that doesn't exist", async t => {
  const { error } = await t.getBrowserConsoleMessages();
  await t.expect(error).match(/The boguscommand command does not exist./);
});
