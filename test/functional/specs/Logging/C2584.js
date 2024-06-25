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
import createConsoleLogger from "../../helpers/consoleLogger/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import { orgMainConfigMain } from "../../helpers/constants/configParts/index.js";
import reloadPage from "../../helpers/reloadPage.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";

createFixture({
  title: "C2584: Toggle logging through setDebug command",
});

test.meta({
  ID: "C2584",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test C2584: setDebug command with enable: true. getLibraryInfo. refresh. toggle and repeat.", async () => {
  const logger = await createConsoleLogger();
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  await alloy.setDebug({ enabled: true });
  await alloy.getLibraryInfo();
  await logger.info.expectMessageMatching(/Executing getLibraryInfo command/);

  await reloadPage();
  await alloy.configure(orgMainConfigMain);
  await alloy.setDebug({ enabled: false });
  await logger.reset();
  await alloy.getLibraryInfo();
  await logger.info.expectNoMessages();
});
