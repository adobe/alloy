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
import { vi, beforeEach, describe, it, expect } from "vitest";
import createRequestPayload from "../../../../../src/utils/request/createRequestPayload.js";

describe("createRequestPayload", () => {
  let content;
  let addIdentity;
  let hasIdentity;
  let payload;

  beforeEach(() => {
    content = {};
    addIdentity = vi.fn();
    hasIdentity = vi.fn();
    payload = createRequestPayload({
      content,
      addIdentity,
      hasIdentity,
    });
  });

  it("returns addIdentity and hasIdentity from options", () => {
    expect(payload.addIdentity).toBe(addIdentity);
    expect(payload.hasIdentity).toBe(hasIdentity);
  });

  it("toJSON returns the content object", () => {
    expect(payload.toJSON()).toBe(content);
    content.foo = "bar";
    expect(payload.toJSON()).toEqual({ foo: "bar" });
  });

  describe("mergeMeta", () => {
    it("deep merges updates into content.meta", () => {
      payload.mergeMeta({ a: 1, b: { c: 2 } });
      expect(content.meta).toEqual({ a: 1, b: { c: 2 } });

      payload.mergeMeta({ b: { d: 3 } });
      expect(content.meta).toEqual({ a: 1, b: { c: 2, d: 3 } });
    });
  });

  describe("mergeState", () => {
    it("deep merges updates into content.meta.state", () => {
      payload.mergeState({ key: "value" });
      expect(content.meta.state).toEqual({ key: "value" });

      payload.mergeState({ other: "data" });
      expect(content.meta.state).toEqual({ key: "value", other: "data" });
    });
  });

  describe("mergeQuery", () => {
    it("deep merges updates into content.query", () => {
      payload.mergeQuery({ schema: ["a", "b"] });
      expect(content.query).toEqual({ schema: ["a", "b"] });

      payload.mergeQuery({ other: { nested: true } });
      expect(content.query).toEqual({
        schema: ["a", "b"],
        other: { nested: true },
      });
    });
  });

  describe("mergeConfigOverride", () => {
    it("shallow merges updates into content.meta.configOverrides", () => {
      payload.mergeConfigOverride({
        com_adobe_analytics: { reportSuites: ["rs1"] },
      });
      expect(content.meta.configOverrides).toEqual({
        com_adobe_analytics: { reportSuites: ["rs1"] },
      });

      // Second merge overwrites same key (shallow merge)
      payload.mergeConfigOverride({
        com_adobe_analytics: { enabled: false },
      });
      expect(content.meta.configOverrides).toEqual({
        com_adobe_analytics: { enabled: false },
      });
    });

    it("creates meta and configOverrides if they do not exist", () => {
      expect(content.meta).toBeUndefined();

      payload.mergeConfigOverride({ someKey: "value" });

      expect(content.meta).toBeDefined();
      expect(content.meta.configOverrides).toEqual({ someKey: "value" });
    });
  });

  describe("finalizeConfigOverrides", () => {
    it("calls prepareConfigOverridesForEdge and replaces content.meta.configOverrides when present", () => {
      content.meta = {
        configOverrides: { a: { enabled: true }, b: {}, c: { rs: "foo" } },
      };

      payload.finalizeConfigOverrides();

      expect(content.meta.configOverrides).toEqual({ c: { rs: "foo" } });
    });

    it("deletes configOverrides when prepareConfigOverridesForEdge returns null", () => {
      content.meta = {
        configOverrides: { a: { enabled: true } },
        other: "data",
      };

      payload.finalizeConfigOverrides();

      expect(content.meta.configOverrides).toBeUndefined();
      expect(content.meta.other).toBe("data");
    });

    it("does nothing when content.meta.configOverrides is absent", () => {
      content.meta = { other: "data" };

      payload.finalizeConfigOverrides();

      expect(content.meta.configOverrides).toBeUndefined();
    });

    it("does nothing when content.meta is absent", () => {
      payload.finalizeConfigOverrides();

      expect(content.meta).toBeUndefined();
    });
  });
});
