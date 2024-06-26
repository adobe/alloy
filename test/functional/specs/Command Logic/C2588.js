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
import createFixture from "../../helpers/createFixture/index.js";
import { orgMainConfigMain } from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

createFixture({
  title: "C2588: Throws error when configure is executed multiple times.",
});

test.meta({
  ID: "C2588",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C2588: Throw error when configure is executed multiple times.", async (t) => {
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  const errorMessage = await alloy.configureErrorMessage(orgMainConfigMain);

  await t
    .expect(errorMessage)
    .match(
      /The library has already been configured and may only be configured once./,
    );
});
