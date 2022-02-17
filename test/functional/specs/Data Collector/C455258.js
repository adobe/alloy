import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createCollectEndpointAsserter from "../../helpers/createCollectEndpointAsserter";

createFixture({
  title:
    "C455258: sendEvent command sends a request to the collect endpoint using sendBeacon when documentUnloading is set to true but only when identity has established."
});

test.meta({
  ID: "C455258",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C455258: sendEvent command sends a request to the collect endpoint when identity has been established and documentUnloading is set to true, interact otherwise.", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);

  // An identity has not yet been established. This request should go to the
  // interact endpoint.
  let response = await alloy.sendEvent({ documentUnloading: true });
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  await t
    .expect("propositions" in response)
    .ok("The 'sendEvent()' response was missing the 'propositions' property");
  response = null;
  await collectEndpointAsserter.reset();

  // An identity has been established. This request should go to the
  // collect endpoint.
  response = await alloy.sendEvent({ documentUnloading: true });
  await collectEndpointAsserter.assertCollectCalledAndNotInteract();
  await t
    .expect("propositions" in response)
    .ok("The 'sendEvent()' response was missing the 'propositions' property");
  response = null;
  await collectEndpointAsserter.reset();

  // documentUnloading is not set to true. The request should go to the
  // interact endpoint.
  response = await alloy.sendEvent();
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  await t
    .expect("propositions" in response)
    .ok("The 'sendEvent()' response was missing the 'propositions' property");
  response = null;
});
