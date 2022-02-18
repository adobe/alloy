import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createCollectEndpointAsserter from "../../helpers/createCollectEndpointAsserter";

createFixture({
  title: "C5298194: Include propositions on every request"
});

test.meta({
  ID: "C5298194",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C5298194: Include propositions on every request", async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);

  let response = await alloy.sendEvent({ documentUnloading: true });
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  await t
    .expect("propositions" in response)
    .ok("The 'sendEvent()' response was missing the 'propositions' property");
  response = null;
  await collectEndpointAsserter.reset();

  response = await alloy.sendEvent();
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  await t
    .expect("propositions" in response)
    .ok("The 'sendEvent()' response was missing the 'propositions' property");
  response = null;
});
