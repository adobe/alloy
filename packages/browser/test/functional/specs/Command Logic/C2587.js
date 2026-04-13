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
import { ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title: "C2587: Throw error when executing command that doesn't exist.",
});

test.meta({
  ID: "C2587",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

const bogusCommand = ClientFunction(() => {
  return window.alloy("bogusCommand").then(
    () => {},
    (error) => error.message,
  );
});

test("Test C2587: Throw error when executing command that doesn't exist", async (t) => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  const errorMessage = await bogusCommand();
  await t
    .expect(errorMessage)
    .match(/The bogusCommand command does not exist./);
});
