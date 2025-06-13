/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { test, expect } from "../../helpers/testsSetup/extend.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";

test("edgeConfigId is swapped with datastreamId when sendEvent command is sent", async ({
  alloy,
  worker,
  networkRecorder,
}) => {
  worker.use(...[sendEventHandler]);

  const config = structuredClone(alloyConfig);
  config.edgeConfigId = config.datastreamId;
  delete config.datastreamId;

  alloy("configure", {
    ...config,
    debugEnabled: true,
  });

  await alloy("sendEvent");

  const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
  expect(call?.request.url.includes(config.edgeConfigId)).toBe(true);
});
