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
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import createRandomEcid from "../../helpers/createRandomEcid.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";
import createAdobeMC from "../../helpers/createAdobeMC.js";

const config = compose(orgMainConfigMain, debugEnabled);

const id = createRandomEcid();
const adobemc = createAdobeMC({ id });

createFixture({
  url: `${TEST_PAGE_URL}?adobe_mc=${adobemc}`,
  title: "C5594871: getIdentity works with adobe_mc query string parameter",
  requestHooks: [],
});

test.meta({
  ID: "C5594871",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("C5594871: getIdentity works with adobe_mc query string parameter", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const ecid = await alloy.getIdentity();
  await t.expect(ecid.identity.ECID).eql(id);
});
