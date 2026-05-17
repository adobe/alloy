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

// Node import smoke tests. These verify that consumers can import the
// `@adobe/alloy-core` entry points and the platform-services contract surface
// in a Node runtime without crashing at module load. They do NOT verify
// runtime behavior — using the SDK in Node still requires a `PlatformServices`
// implementation and the per-domain migrations described in
// packages/browser/UNIVERSAL_JS_MIGRATION.md.
//
// Imports here are static on purpose: the spec file failing to load is itself
// the failure signal we want. Dynamic `await import()` inside `it()` blocks
// gets charged against the per-test timeout, and Vite's first-run dep
// bundling can blow past 5s when the full vitest suite runs in parallel.
import { describe, it, expect } from "vitest";
import * as core from "@adobe/alloy-core";
import * as coreServices from "@adobe/alloy-core/services";
import * as node from "../../src/index.js";

describe("Node import smoke", () => {
  it("imports @adobe/alloy-core without throwing", () => {
    expect(core.createCustomInstance).toBeTypeOf("function");
    expect(core.createInstance).toBeTypeOf("function");
  });

  it("imports @adobe/alloy-core/services without throwing", () => {
    expect(coreServices).toBeDefined();
  });

  it("imports @adobe/alloy-node without throwing", () => {
    expect(node.createInstance).toBeTypeOf("function");
    expect(node.createCustomInstance).toBeTypeOf("function");
  });
});
