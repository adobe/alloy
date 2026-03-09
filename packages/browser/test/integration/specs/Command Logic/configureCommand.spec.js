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
import searchForLogMessage from "../../helpers/utils/searchForLogMessage.js";

describe("Configure command", () => {
  let consoleSpy;
  describe("when edgeConfigId is provided", () => {
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

      await alloy("configure", {
        ...config,
        debugEnabled: true,
      });

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

      await alloy("configure", {
        ...config,
        debugEnabled: true,
      });

      expect(
        searchForLogMessage(
          consoleSpy,
          "The field 'edgeConfigId' is deprecated.",
        ),
      ).toBe(true);
    });
  });

  test("throws error when no options are provided", async ({ alloy }) => {
    let error;

    try {
      await alloy("configure");
    } catch (e) {
      error = e;
    }

    expect(error.message).toContain("orgId");
    expect(error.message).toContain("datastreamId");
    expect(error.message).toContain("documentation");
  });

  test("throws error when it is called multple times", async ({ alloy }) => {
    let error;

    try {
      await alloy("configure", alloyConfig);
      await alloy("configure", alloyConfig);
    } catch (e) {
      error = e;
    }

    expect(error.message).toContain(
      "The library has already been configured and may only be configured once.",
    );
  });

  test("returns a promise that resolves with an empty result object", async ({
    alloy,
  }) => {
    const result = await alloy("configure", alloyConfig);

    expect(result).toEqual({});
  });
});
