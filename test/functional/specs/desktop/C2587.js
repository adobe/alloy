import { ClientFunction } from "testcafe";
import testServerUrl from "../../helpers/constants/testServerUrl";
import fixtureFactory from "../../helpers/fixtureFactory";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import debugEnabledConfig from "../../helpers/constants/debugEnabledConfig";

fixtureFactory({
  title: "C2587: Throw error when executing command that doesn't exist.",
  url: `${testServerUrl}/test/functional/sandbox/html/alloyTestPage.html`
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
  await configureAlloyInstance("alloy", {
    errorsEnabled: false,
    ...debugEnabledConfig
  });
  await bogusCommand();
})(
  "Test C2587: Throw error when executing command that doesn't exist",
  async t => {
    const { error } = await t.getBrowserConsoleMessages();
    await t.expect(error).match(/The bogusCommand command does not exist./);
  }
);
