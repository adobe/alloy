/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";
import configValidators from "../../../../../src/components/Advertising/configValidators.js";

describe("Advertising configValidators", () => {
  it("allows the advertising object to be left out", () => {
    expect(configValidators({})).toEqual({});
  });

  it("defaults enabled to true", () => {
    const { advertising } = configValidators({ advertising: {} });
    expect(advertising.enabled).toBe(true);
  });

  [true, false].forEach((enabled) => {
    it(`accepts enabled: ${enabled}`, () => {
      const { advertising } = configValidators({ advertising: { enabled } });
      expect(advertising.enabled).toBe(enabled);
    });
  });

  ["false", "true", 0, 1, {}].forEach((enabled) => {
    it(`rejects enabled: ${JSON.stringify(enabled)}`, () => {
      expect(() => configValidators({ advertising: { enabled } })).toThrow(
        /advertising\.enabled/,
      );
    });
  });

  it("keeps the other advertising settings", () => {
    const { advertising } = configValidators({
      advertising: {
        enabled: false,
        dspEnabled: true,
        id5PartnerId: "partner",
        rampIdJSPath: "/ramp.js",
        advertiserSettings: [{ advertiserId: "123", enabled: true }],
      },
    });
    expect(advertising).toEqual({
      enabled: false,
      dspEnabled: true,
      id5PartnerId: "partner",
      rampIdJSPath: "/ramp.js",
      advertiserSettings: [{ advertiserId: "123", enabled: true }],
    });
  });
});
