/*
Copyright 2021 Adobe. All rights reserved.
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

const title =
  "C3484892: Resolves promise with empty result object from configure command.";

createFixture({
  title,
});

test.meta({
  ID: "C3484892",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test(title, async (t) => {
  const alloy = createAlloyProxy();
  const result = await alloy.configure(orgMainConfigMain);
  await t.expect(result).eql({});
});
