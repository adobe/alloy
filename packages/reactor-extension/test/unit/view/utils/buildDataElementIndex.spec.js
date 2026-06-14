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

import buildDataElementIndex from "../../../../src/view/utils/buildDataElementIndex";

describe("buildDataElementIndex", () => {
  it("returns empty maps for an empty input", () => {
    const { byId, byName } = buildDataElementIndex([]);
    expect(byId.size).toBe(0);
    expect(byName.size).toBe(0);
  });

  it("indexes each data element by id and by name", () => {
    const a = { id: "DE1", name: "Alpha", settings: {} };
    const b = { id: "DE2", name: "Beta", settings: {} };
    const { byId, byName } = buildDataElementIndex([a, b]);

    expect(byId.get("DE1")).toBe(a);
    expect(byId.get("DE2")).toBe(b);
    expect(byName.get("Alpha")).toEqual([a]);
    expect(byName.get("Beta")).toEqual([b]);
  });

  it("groups duplicates under the same name preserving order", () => {
    const a1 = { id: "DE1", name: "Dup", settings: {} };
    const a2 = { id: "DE2", name: "Dup", settings: {} };
    const b = { id: "DE3", name: "Solo", settings: {} };
    const { byId, byName } = buildDataElementIndex([a1, a2, b]);

    expect(byId.size).toBe(3);
    expect(byName.get("Dup")).toEqual([a1, a2]);
    expect(byName.get("Solo")).toEqual([b]);
  });

  it("name lookup is case-sensitive (no normalization)", () => {
    const a = { id: "DE1", name: "MyVar", settings: {} };
    const { byName } = buildDataElementIndex([a]);

    expect(byName.get("MyVar")).toEqual([a]);
    expect(byName.get("myvar")).toBeUndefined();
    expect(byName.get("MYVAR")).toBeUndefined();
  });
});
