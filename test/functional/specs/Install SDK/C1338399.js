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
import { t, ClientFunction } from "testcafe";
import createFixture from "../../helpers/createFixture/index.js";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import {
  compose,
  orgMainConfigMain,
  debugEnabled,
  migrationDisabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

const mainConfig = compose(orgMainConfigMain, debugEnabled, migrationDisabled);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C1338399: Use SDK from NPM entry point",
  includeAlloyLibrary: false,
  includeNpmLibrary: true,
  requestHooks: [networkLogger.edgeEndpointLogs],
});

const createAlloyInstance = ClientFunction(() => {
  window.npmLibraryAlloy = window.alloyCreateInstance({
    name: "npmLibraryAlloy",
  });
});

test.meta({
  ID: "C1338399: Use SDK from NPM entry point",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("C1338399: Use SDK from NPM entry point", async () => {
  await createAlloyInstance();
  const alloy = createAlloyProxy("npmLibraryAlloy");
  await alloy.configure(mainConfig);
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
});
