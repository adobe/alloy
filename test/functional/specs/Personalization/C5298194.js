/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { t } from "testcafe";
import createFixture from "../../helpers/createFixture/index.js";
import { orgMainConfigMain } from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import createCollectEndpointAsserter from "../../helpers/createCollectEndpointAsserter.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";

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
