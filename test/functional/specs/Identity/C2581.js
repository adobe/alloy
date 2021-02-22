import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import SequentialHook from "../../helpers/requestHooks/sequentialHook";
import cookies from "../../helpers/cookies";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import { MAIN_IDENTITY_COOKIE_NAME } from "../../helpers/constants/cookies";
import createAlloyProxy from "../../helpers/createAlloyProxy";

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

test("Test C2581: Queue requests until we receive an ECID.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(debugEnabledConfig);
  await alloy.sendEventAsync({ renderDecisions: true });
  await alloy.sendEvent();
  await t.expect(interactHook.numRequests).eql(2);
  await t
    .expect(interactHook.haveRequestsBeenSequential())
    .ok("Interact requests were not sequential");
  const identityCookieValue = await cookies.get(MAIN_IDENTITY_COOKIE_NAME);
  await t.expect(identityCookieValue).ok("No identity cookie found.");
});
