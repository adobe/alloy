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
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import createFixture from "../../helpers/createFixture/index.js";

createFixture({
  title: "C13817: Throws error when running command after bad configure"
});

test.meta({
  ID: "C13817",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C13817: Throws error when running command after bad configure", async t => {
  const alloy = createAlloyProxy();
  await alloy.configureErrorMessage();
  const eventErrorMessage = await alloy.sendEventErrorMessage();
  await t.expect(eventErrorMessage).contains("configured");
});
