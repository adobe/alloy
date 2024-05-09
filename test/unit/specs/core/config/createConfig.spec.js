/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createConfig from "../../../../../src/core/config/createConfig.js";

let testConfig = {};

describe("createConfig", () => {
  beforeEach(() => {
    testConfig = {
      a: 123,
      b: "abc",
      c: {
        a1: "xyz",
      },
      neg: {
        neg: false,
      },
    };
  });
  it("supports being instantiated with a config", () => {
    const cfg = createConfig(testConfig);
    expect(cfg.a).toEqual(123);
  });
  it("supports getting a value assigned to a key", () => {
    const cfg = createConfig(testConfig);
    expect(cfg.a).toEqual(123);
  });
  it("returns undefined when a missing key is requested", () => {
    const cfg = createConfig(testConfig);
    expect(cfg.missing).toBe(undefined);
  });
  it("supports adding a key value mapping", () => {
    const cfg = createConfig(testConfig);
    cfg.d = "ABC";
    expect(cfg.d).toEqual("ABC");
  });

  describe("changing config", () => {
    it("does not change the provided options", () => {
      const cfg = createConfig(testConfig);
      cfg.d = "NEW VALUE";
      expect(testConfig.d).toBe(undefined);
    });
  });

  describe("changing provided options", () => {
    it("does not change the config", () => {
      const cfg = createConfig(testConfig);
      testConfig.a = 456;
      expect(cfg.a).toBe(123);
    });
  });
});
