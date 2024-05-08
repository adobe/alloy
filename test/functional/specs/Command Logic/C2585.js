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
  title: "C2585: Throws error when configure is not the first command executed."
});

test.meta({
  ID: "C2585",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C2585: Throw error when configure is not the first command executed.", async t => {
  // Note: unable to enable logging with url parameter or enabler logger config.
  const alloy = createAlloyProxy();
  const sendEventErrorMessage = await alloy.sendEventErrorMessage();
  await t
    .expect(sendEventErrorMessage)
    .match(
      /The library must be configured first. Please do so by executing the configure command./
    );
});
