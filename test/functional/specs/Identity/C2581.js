import { t, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";

import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import SequentialHook from "../../helpers/requestHooks/sequentialHook";
import cookies from "../../helpers/cookies";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { MAIN_IDENTITY_COOKIE_NAME } from "../../helpers/constants/cookies";

const debugEnabledConfig = compose(
  orgMainConfigMain,
  debugEnabled
);

const interactHook = new SequentialHook(/v1\/interact\?/);

createFixture({
  title: "C2581: Queue events when no ECID available on client",
  requestHooks: [interactHook]
});

test.meta({
  ID: "C2581",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const triggerAlloyEvents = ClientFunction(() => {
  return Promise.all([
    window.alloy("sendEvent", {
      renderDecisions: true
    }),
    window.alloy("sendEvent")
  ]);
});

test("Test C2581: Queue requests until we receive an ECID.", async () => {
  await configureAlloyInstance("alloy", debugEnabledConfig);
  await triggerAlloyEvents();
  await t.expect(interactHook.numRequests).eql(2);
  await t
    .expect(interactHook.haveRequestsBeenSequential())
    .ok("Interact requests were not sequential");
  const identityCookieValue = await cookies.get(MAIN_IDENTITY_COOKIE_NAME);
  await t.expect(identityCookieValue).ok("No identity cookie found.");
});
