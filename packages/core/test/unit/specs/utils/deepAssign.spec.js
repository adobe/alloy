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

import { describe, it, expect } from "vitest";
import deepAssign from "../../../../src/utils/deepAssign.js";

describe("deepAssign", () => {
  it("should throw when target is null or undefined", () => {
    expect(() => {
      deepAssign(null, {
        a: 1,
      });
    }).toThrow();
    expect(() => {
      deepAssign(undefined, {
        a: 1,
      });
    }).toThrow();
  });
  it("should assign when target is string", () => {
    const result1 = deepAssign("foo", {
      a: 1,
    });
    const result2 = Object.assign("foo", {
      a: 1,
    });
    expect(result1).toEqual(result2);
  });
  it("should assign when target is number", () => {
    const result1 = deepAssign(1, {
      a: 1,
    });
    const result2 = Object.assign(1, {
      a: 1,
    });
    expect(result1).toEqual(result2);
  });
  it("should assign when target is array", () => {
    const result1 = deepAssign([1], {
      a: 1,
    });
    const result2 = Object.assign([1], {
      a: 1,
    });
    expect(result1).toEqual(result2);
  });
  it("should assign when target is object and source is string", () => {
    const result1 = deepAssign({}, "foo");
    const result2 = {
      ..."foo",
    };
    expect(result1).toEqual(result2);
  });
  it("should assign when target is object and source is number", () => {
    const result1 = deepAssign({}, 1);
    const result2 = {
      ...1,
    };
    expect(result1).toEqual(result2);
  });
  it("should assign when target is object and source is array", () => {
    const result1 = deepAssign({}, [1]);
    const result2 = {
      ...[1],
    };
    expect(result1).toEqual(result2);
  });
  it("should assign values recursively", () => {
    const result = deepAssign(
      {},
      {
        a: {
          c: 1,
        },
      },
      {
        b: 2,
      },
      {
        a: {
          c: 2,
          d: 3,
        },
      },
    );
    expect(result).toEqual({
      a: {
        c: 2,
        d: 3,
      },
      b: 2,
    });
  });

  describe("prototype pollution protection", () => {
    it("should not copy __proto__ key", () => {
      const target = {};
      const maliciousPayload = JSON.parse('{"__proto__": {"polluted": true}}');

      deepAssign(target, maliciousPayload);

      expect(target.__proto__).not.toHaveProperty("polluted");
      expect({}.polluted).toBeUndefined();
    });

    it("should not copy constructor key", () => {
      const target = {};
      const source = {
        constructor: {
          polluted: true,
        },
      };

      deepAssign(target, source);

      expect(target.constructor).not.toHaveProperty("polluted");
    });

    it("should not copy prototype key", () => {
      const target = {};
      const source = {
        prototype: {
          polluted: true,
        },
      };

      deepAssign(target, source);

      expect(target.prototype).toBeUndefined();
    });

    it("should not copy dangerous keys in nested objects", () => {
      const target = {
        nested: {
          safe: "value",
        },
      };
      const source = {
        nested: {
          __proto__: {
            polluted: true,
          },
          constructor: {
            polluted: true,
          },
          safe: "updated",
        },
      };

      deepAssign(target, source);

      expect(target.nested.safe).toBe("updated");
      expect(target.nested.__proto__).not.toHaveProperty("polluted");
      expect(target.nested.constructor).not.toHaveProperty("polluted");
    });

    it("should copy safe keys while skipping dangerous ones", () => {
      const target = {};
      const source = {
        safeKey: "safe",
        __proto__: {
          polluted: true,
        },
        anotherSafeKey: "also safe",
        constructor: {
          polluted: true,
        },
      };

      const result = deepAssign(target, source);

      expect(result.safeKey).toBe("safe");
      expect(result.anotherSafeKey).toBe("also safe");
      expect(result.__proto__).not.toHaveProperty("polluted");
      expect(result.constructor).not.toHaveProperty("polluted");
    });

    it("should handle multiple sources with dangerous keys", () => {
      const target = {};
      const source1 = {
        __proto__: {
          polluted1: true,
        },
        safe1: "value1",
      };
      const source2 = {
        constructor: {
          polluted2: true,
        },
        safe2: "value2",
      };

      const result = deepAssign(target, source1, source2);

      expect(result.safe1).toBe("value1");
      expect(result.safe2).toBe("value2");
      expect(result.__proto__).not.toHaveProperty("polluted1");
      expect(result.constructor).not.toHaveProperty("polluted2");
    });
  });
});
