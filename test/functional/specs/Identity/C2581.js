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

const identityCookieName = "kndctr_334F60F35E1597910A495EC2_AdobeOrg_identity";

test("Test C2581: Queue requests until we receive an ECID.", async () => {
  await configureAlloyInstance("alloy", debugEnabledConfig);
  await triggerAlloyEvents();
  await t.expect(interactHook.numRequests).eql(2);
  await t
    .expect(interactHook.haveRequestsBeenSequential())
    .ok("Interact requests were not sequential");
  const identityCookieValue = await cookies.get(identityCookieName);
  await t.expect(identityCookieValue).ok("No identity cookie found.");
});
