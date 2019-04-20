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

import createConfig from "../../../src/core/createConfig";

const testConfig = {
  a: 123,
  b: "abc",
  c: {
    a1: "xyz"
  }
};

describe("createConfig", () => {
  fit("supports being instantiated with a config", () => {
    const cfg = createConfig(testConfig);
    expect(cfg.a).toEqual(123);
    expect(cfg.c.a1).toEqual("xyz");
  });
  fit("supports getting a value assigned to a key", () => {
    const cfg = createConfig(testConfig);
    expect(cfg.get("a")).toEqual(123);
  });
  fit("supports getting a default value when a key is missing", () => {
    const cfg = createConfig(testConfig);
    expect(cfg.get("z", "missing")).toEqual("missing");
  });
  fit("supports adding a key value mapping", () => {
    const cfg = createConfig(testConfig);
    cfg.put("d", "ABC");
    expect(cfg.get("d")).toEqual("ABC");
  });
  fit("supports extending the config with a new config", () => {
    const cfg = createConfig(testConfig);
    cfg.putAll({
      d: {
        b1: 321
      }
    });
    expect(cfg.d.b1).toEqual(321);
  });
  fit("supports adding missing object hierarchies through string dot notation", () => {
    const cfg = createConfig(testConfig);
    cfg.put("c.b1.a2.a3", 321);
    expect(cfg.c.b1.a2.a3).toEqual(321);
  });
  fit("supports getting a value within object hiearchies through string dot notation", () => {
    const cfg = createConfig(testConfig);
    expect(cfg.get("c.a1")).toEqual("xyz");
  });
  fit("supports returning top level key-set", () => {
    const cfg = createConfig(testConfig);
    const s = cfg.keySet();
    expect(s.has("a")).toBe(true);
    expect(s.has("b")).toBe(true);
    expect(s.has("c")).toBe(true);
    expect(s.has("get")).toBe(false);
  });
});
