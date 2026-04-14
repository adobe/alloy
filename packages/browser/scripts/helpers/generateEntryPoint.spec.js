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

import { describe, expect, test } from "vitest";
import { generateEntryPointSource } from "./generateEntryPoint.js";

describe("generateEntryPointSource", () => {
  test("imports all provided components from allOptionalComponents.js", () => {
    const source = generateEntryPointSource(["audiences", "consent"]);
    expect(source).toContain(
      `import { audiences, consent } from "./allOptionalComponents.js"`,
    );
  });

  test("passes components as an explicit array to initializeStandalone", () => {
    const source = generateEntryPointSource(["audiences", "consent"]);
    expect(source).toContain(
      "initializeStandalone({ components: [audiences, consent] })",
    );
  });

  test("produces no allOptionalComponents import when given an empty array", () => {
    const source = generateEntryPointSource([]);
    expect(source).not.toContain("allOptionalComponents");
  });

  test("passes an empty array to initializeStandalone when no modules given", () => {
    const source = generateEntryPointSource([]);
    expect(source).toContain("initializeStandalone({ components: [] })");
  });

  test("always imports initializeStandalone", () => {
    const source = generateEntryPointSource([]);
    expect(source).toContain(
      `import initializeStandalone from "./initializeStandalone.js"`,
    );
  });

  test("works with all 11 default optional components", () => {
    const allComponents = [
      "audiences",
      "consent",
      "eventMerge",
      "mediaAnalyticsBridge",
      "personalization",
      "rulesEngine",
      "streamingMedia",
      "advertising",
      "pushNotifications",
      "brandConcierge",
      "activityCollector",
    ];
    const source = generateEntryPointSource(allComponents);
    const joined = allComponents.join(", ");
    expect(source).toContain(
      `import { ${joined} } from "./allOptionalComponents.js"`,
    );
    expect(source).toContain(
      `initializeStandalone({ components: [${joined}] })`,
    );
  });
});
