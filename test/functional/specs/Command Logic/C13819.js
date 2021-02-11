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

import { ClientFunction } from "testcafe";
import {
  compose,
  orgMainConfigMain
} from "../../helpers/constants/configParts";
import createFixture from "../../helpers/createFixture";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";

const config = compose(
  orgMainConfigMain,
  {
    edgeConfigId: "BOGUS"
  }
);

createFixture({
  title:
    "C13819: Sending invalid config ID rejects command promise with useful error"
});

test.meta({
  ID: "C13819",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const sendEvent = ClientFunction(() => {
  return window.alloy("sendEvent").catch(e => e.message);
});

test("Test C13819: Sending invalid config ID rejects command promise with useful error", async t => {
  await configureAlloyInstance("alloy", config);
  const errorMessage = await sendEvent();
  await t
    .expect(errorMessage)
    .contains(
      "Unexpected server response with status code 400 and response body"
    );
  await t.expect(errorMessage).contains("EXEG-0003-400");
});
