fixture`C2585`.page(
  "https://sandbox-qe.azurewebsites.net/sandbox/html/C2585.html"
);

const testDescription =
  "Regression: Throw error when configure is not the first command executed.";

test.meta({
  ID: "C2585",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
})(testDescription, async t => {
  const { error } = await t.getBrowserConsoleMessages();
  await t
    .expect(error)
    .eql([
      '[alloy] Error: [alloy] The library must be configured first. Please do so by calling alloy("configure", {...}).'
    ]);
});
