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
import {
  test,
  expect,
  describe,
  vi,
  beforeEach,
  afterEach,
} from "../../helpers/testsSetup/extend.js";
import alloyConfig from "../../helpers/alloy/config.js";
import getOnCommandResolvedPromise from "../../helpers/utils/getOnCommandResolvedPromise.js";
import searchForLogMessage from "../../helpers/utils/searchForLogMessage.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";

describe("edgeConfigId configuration", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "warn");
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("logs a warning when only edgeConfigId exits in the config object", async ({
    alloy,
  }) => {
    const config = structuredClone(alloyConfig);
    config.edgeConfigId = config.datastreamId;
    delete config.datastreamId;

    const p = getOnCommandResolvedPromise("configure");

    alloy("configure", {
      ...config,
      debugEnabled: true,
    });

    await p;

    expect(
      searchForLogMessage(
        consoleSpy,
        "The field 'edgeConfigId' is deprecated.",
      ),
    ).toBe(true);
  });

  test("logs a warning when edgeConfigId and datastreamId exits in the config object", async ({
    alloy,
  }) => {
    const config = structuredClone(alloyConfig);
    config.edgeConfigId = config.datastreamId;

    const p = getOnCommandResolvedPromise("configure");

    alloy("configure", {
      ...config,
      debugEnabled: true,
    });

    await p;

    expect(
      searchForLogMessage(
        consoleSpy,
        "The field 'edgeConfigId' is deprecated.",
      ),
    ).toBe(true);
  });

  test("is swapped with datastreamId when sendEvent command is sent", async ({
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
});
