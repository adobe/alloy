/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { t } from "testcafe";
import {
  compose,
  orgMainConfigMain
} from "../../helpers/constants/configParts";
import { TEST_PAGE } from "../../helpers/constants/url";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createFixture from "../../helpers/createFixture";

const mainConfig = compose(orgMainConfigMain, {
  orgId: orgMainConfigMain.orgId.replace("8", "eight")
});

createFixture({
  url: TEST_PAGE,
  title:
    "C5598188: Informative error messages are given when an identity cookie fails to be set"
});

test.meta({
  ID: "C5598188",
  SEVERTIY: "P0",
  TEST_RUN: "Regression"
});

test("C5598188: Informative error message given when using an invalid orgID", async () => {
  const validAlloy = createAlloyProxy();
  await validAlloy.configure(mainConfig);
  const errorMessage = await validAlloy.sendEventErrorMessage({});

  await t.expect(errorMessage).contains("org ID");
  await t.expect(errorMessage).contains(mainConfig.orgId);
  await t.expect(errorMessage).contains(mainConfig.edgeDomain);
});
