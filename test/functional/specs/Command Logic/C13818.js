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
import { RequestLogger, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture";

import {
  orgMainConfigMain,
  orgAltConfigAlt
} from "../../helpers/constants/configParts";

const networkLoggerConfig = {
  logRequestBody: true,
  stringifyRequestBody: true
};
const networkLogger1 = RequestLogger(
  new RegExp(
    `v1\\/(interact|collect)\\?configId=${orgMainConfigMain.edgeConfigId}`
  ),
  networkLoggerConfig
);
const networkLogger2 = RequestLogger(
  new RegExp(
    `v1\\/(interact|collect)\\?configId=${orgAltConfigAlt.edgeConfigId}`
  ),
  networkLoggerConfig
);

createFixture({
  title:
    "C13818: Changing the options object after configure doesn't change the computed config",
  requestHooks: [networkLogger1, networkLogger2]
});

test.meta({
  ID: "C13818",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const apiCalls = ClientFunction((configObject, alternateConfigObject) => {
  return window.alloy("configure", configObject).then(() => {
    Object.keys(alternateConfigObject).forEach(key => {
      configObject[key] = alternateConfigObject[key];
    });
    return window.alloy("sendEvent");
  });
});

test("Test C13818: Changing the options object after configure doesn't change the computed config", async t => {
  await apiCalls(orgMainConfigMain, orgAltConfigAlt);

  await t.expect(networkLogger1.requests.length).eql(1);
  await t.expect(networkLogger2.requests.length).eql(0);
});
