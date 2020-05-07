import { ClientFunction } from "testcafe";
import fixtureFactory from "../helpers/fixtureFactory";

fixtureFactory({
  title: "C2585: Throws error when configure is not the first command executed."
});

test.meta({
  ID: "C2585",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvent = ClientFunction(() => {
  return new Promise(resolve => {
    window
      .alloy("configure", {
        debugEnabled: true
      })
      .catch(() => {
        window.alloy("sendEvent", { xdm: { key: "value" } }).catch(resolve);
      });
  });
});

test("Test C2585: Throw error when configure is not the first command executed.", async t => {
  // Note: unable to enable logging with url parameter or enabler logger config.

  const errorMessage = await triggerAlloyEvent();

  await t
    .expect(errorMessage)
    .match(
      /The library must be configured first. Please do so by executing the configure command./
    );
});
