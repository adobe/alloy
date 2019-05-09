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

import { includes } from "../../../src/utils";
import createConfig from "../../../src/core/createConfig";

let testConfig = {};

const testValidator1 = {
  a: {
    validate: (config, currentValue) => {
      if (currentValue == null) {
        throw new Error("a is missing");
      }
    }
  },
  "c.a2": {
    defaultValue: "zyx"
  }
};

const testValidator2 = {
  orgId: {
    validate: (config, currentValue) => {
      if (currentValue == null) {
        throw new Error("orgId is missing");
      }
    }
  }
};

describe("createConfig", () => {
  beforeEach(() => {
    testConfig = {
      a: 123,
      b: "abc",
      c: {
        a1: "xyz"
      },
      neg: {
        neg: false
      }
    };
  });
  it("supports being instantiated with a config", () => {
    const cfg = createConfig(testConfig);
    expect(cfg.a).toEqual(123);
    expect(cfg.c.a1).toEqual("xyz");
  });
  it("supports getting a value assigned to a key", () => {
    const cfg = createConfig(testConfig);
    expect(cfg.get("a")).toEqual(123);
  });
  it("returns undefined when a missing key is requested", () => {
    const cfg = createConfig(testConfig);
    expect(cfg.get("missing")).toBe(undefined);
    expect(cfg.get("missing.missing")).toBe(undefined);
    expect(cfg.get("c.missing")).toBe(undefined);
  });
  it("supports getting a default value when a key is missing", () => {
    const cfg = createConfig(testConfig);
    expect(cfg.get("z", "missing")).toEqual("missing");
  });
  it("supports adding a key value mapping", () => {
    const cfg = createConfig(testConfig);
    cfg.set("d", "ABC");
    expect(cfg.get("d")).toEqual("ABC");
  });
  it("supports extending the config with a new config", () => {
    const cfg = createConfig(testConfig);
    cfg.setAll({
      d: {
        b1: 321
      }
    });
    expect(cfg.d.b1).toEqual(321);
  });
  it("supports adding missing object hierarchies through string dot notation", () => {
    const cfg = createConfig(testConfig);
    cfg.set("c.b1.a2.a3", 321);
    expect(cfg.c.b1.a2.a3).toEqual(321);
  });
  it("supports getting a value within object hiearchies through string dot notation", () => {
    const cfg = createConfig(testConfig);
    expect(cfg.get("c.a1")).toEqual("xyz");
  });
  it("supports returning top level key-set", () => {
    const cfg = createConfig(testConfig);
    const s = cfg.keySet();
    expect(includes(s, "a")).toBe(true);
    expect(includes(s, "b")).toBe(true);
    expect(includes(s, "c")).toBe(true);
    expect(includes(s, "get")).toBe(false);
  });
  it("supports handling false values", () => {
    const cfg = createConfig(testConfig);
    expect(cfg.get("neg.neg")).toBe(false);
  });
  it("supports validation against a schema", () => {
    const cfg = createConfig(testConfig);
    cfg.addValidators(testValidator1);
    expect(() => {
      cfg.validate();
    }).not.toThrow();
  });
  it("throws error when validation fails", () => {
    const cfg = createConfig(testConfig);
    cfg.addValidators(testValidator1);
    cfg.addValidators(testValidator2);
    expect(() => {
      cfg.validate();
    }).toThrow();
  });
  it("sets default if defined in validator", () => {
    const cfg = createConfig(testConfig);
    cfg.addValidators(testValidator1);
    cfg.validate();
    expect(cfg.get("c.a2")).toEqual("zyx");
  });
});
