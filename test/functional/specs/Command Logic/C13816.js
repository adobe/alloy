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
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createFixture from "../../helpers/createFixture";

createFixture({
  title: "C13816: Throws error when configure has no options"
});

test.meta({
  ID: "C13816",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C13816: Throws error when configure has no options", async t => {
  const alloy = createAlloyProxy();
  const configureErrorMessage = await alloy.configureErrorMessage();

  await t
    .expect(configureErrorMessage)
    .ok("Configure didn't throw an exception.");
  await t.expect(configureErrorMessage).contains("orgId");
  await t.expect(configureErrorMessage).contains("datastreamId");
  await t.expect(configureErrorMessage).contains("documentation");
});
