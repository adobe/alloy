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
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../src/view/utils/fetchDataElements");

import fetchDataElementByName from "../../../../src/view/utils/fetchDataElementByName";
import fetchDataElements from "../../../../src/view/utils/fetchDataElements";

const makeDE = (name, id) => ({ id, name, settings: {} });

describe("fetchDataElementByName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the matching data element when found on the first page", async () => {
    fetchDataElements.mockResolvedValueOnce({
      results: [makeDE("My Variable", "DE1"), makeDE("Other", "DE2")],
      nextPage: null,
    });

    const result = await fetchDataElementByName({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
      name: "My Variable",
    });

    expect(fetchDataElements).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ id: "DE1", name: "My Variable" });
  });

  it("paginates until the exact match is found on a later page", async () => {
    fetchDataElements
      .mockResolvedValueOnce({
        results: [
          makeDE("My Variable 2024", "DE1"),
          makeDE("My Variable 2025", "DE2"),
        ],
        nextPage: 2,
      })
      .mockResolvedValueOnce({
        results: [makeDE("My Variable", "DE3")],
        nextPage: null,
      });

    const result = await fetchDataElementByName({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
      name: "My Variable",
    });

    expect(fetchDataElements).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ id: "DE3", name: "My Variable" });
  });

  it("stops as soon as the exact match is found even if more pages exist", async () => {
    fetchDataElements
      .mockResolvedValueOnce({
        results: [makeDE("My Variable 2024", "DE1")],
        nextPage: 2,
      })
      .mockResolvedValueOnce({
        results: [makeDE("My Variable", "DE2")],
        nextPage: 3,
      });

    await fetchDataElementByName({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
      name: "My Variable",
    });

    expect(fetchDataElements).toHaveBeenCalledTimes(2);
  });

  it("does not return a partial-name match — only an exact match", async () => {
    fetchDataElements.mockResolvedValueOnce({
      results: [makeDE("My Variable 2024", "DE1")],
      nextPage: null,
    });

    const result = await fetchDataElementByName({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
      name: "My Variable",
    });

    expect(result).toBeUndefined();
  });

  it("returns undefined when no data element with that name exists", async () => {
    fetchDataElements.mockResolvedValueOnce({
      results: [],
      nextPage: null,
    });

    const result = await fetchDataElementByName({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
      name: "Nonexistent",
    });

    expect(result).toBeUndefined();
  });
});
