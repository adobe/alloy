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
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createFixture from "../../helpers/createFixture";

createFixture({
  title: "C4266607 sendEvent command returns an `inferences` key in the result"
});

test.meta({
  ID: "C4266607",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C4266607 sendEvent command returns an `inferences` key in the result", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  const result = await alloy.sendEvent();

  await t.expect(result.inferences).eql([]);
});
