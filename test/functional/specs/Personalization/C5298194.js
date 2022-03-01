import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createCollectEndpointAsserter from "../../helpers/createCollectEndpointAsserter";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";

createFixture({
  title: "C5298194: Include propositions on every request"
});

test.meta({
  ID: "C5298194",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const runTest = async () => {
  const collectEndpointAsserter = await createCollectEndpointAsserter();
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);

  // check that interact calls return propositions.
  let response = await alloy.sendEvent();
  await collectEndpointAsserter.assertInteractCalledAndNotCollect();
  await t
    .expect("propositions" in response)
    .ok("The 'sendEvent()' response was missing the 'propositions' property");
  await t
    .expect(Array.isArray(response.propositions))
    .ok("response.propositions is not an array");
  response = null;
  await collectEndpointAsserter.reset();

  // check that collect calls return propositions.
  response = await alloy.sendEvent({ documentUnloading: true });
  await collectEndpointAsserter.assertCollectCalledAndNotInteract();
  await t
    .expect("propositions" in response)
    .ok("The 'sendEvent()' response was missing the 'propositions' property");
  await t
    .expect(Array.isArray(response.propositions))
    .ok("response.propositions is not an array");
  response = null;
  await collectEndpointAsserter.reset();
};

test("Test C5298194: Include propositions on every request", runTest);

test.page(`${TEST_PAGE_URL}?adobe_authoring_enabled=true`)(
  "Test C5298194: Include propositions on every request in authoring mode",
  runTest
);
