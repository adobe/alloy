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

vi.mock("../../../../src/view/utils/fetchFromReactor");

import fetchDataElementByName from "../../../../src/view/utils/fetchDataElementByName";

import fetchFromReactor from "../../../../src/view/utils/fetchFromReactor";

const DELEGATE_DESCRIPTOR_ID = "__EXTENSION_NAME__::dataElements::variable";

const makeDE = (name, id) => ({
  id,
  attributes: {
    name,
    delegate_descriptor_id: DELEGATE_DESCRIPTOR_ID,
    settings: JSON.stringify({ solutions: ["analytics"] }),
  },
});

const makeResponse = (des, nextPage) => ({
  parsedBody: {
    data: des,
    meta: { pagination: { next_page: nextPage } },
  },
});

describe("fetchDataElementByName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the matching data element when found on the first page", async () => {
    fetchFromReactor.mockResolvedValueOnce(
      makeResponse(
        [makeDE("My Variable", "DE1"), makeDE("Other", "DE2")],
        null,
      ),
    );

    const result = await fetchDataElementByName({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
      name: "My Variable",
    });

    expect(fetchFromReactor).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ id: "DE1", name: "My Variable" });
  });

  it("paginates until the exact match is found on a later page", async () => {
    fetchFromReactor
      .mockResolvedValueOnce(
        makeResponse(
          [
            makeDE("My Variable 2024", "DE1"),
            makeDE("My Variable 2025", "DE2"),
          ],
          2,
        ),
      )
      .mockResolvedValueOnce(
        makeResponse([makeDE("My Variable", "DE3")], null),
      );

    const result = await fetchDataElementByName({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
      name: "My Variable",
    });

    expect(fetchFromReactor).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({ id: "DE3", name: "My Variable" });
  });

  it("stops as soon as the exact match is found even if more pages exist", async () => {
    fetchFromReactor
      .mockResolvedValueOnce(
        makeResponse([makeDE("My Variable 2024", "DE1")], 2),
      )
      .mockResolvedValueOnce(makeResponse([makeDE("My Variable", "DE2")], 3));

    await fetchDataElementByName({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
      name: "My Variable",
    });

    expect(fetchFromReactor).toHaveBeenCalledTimes(2);
  });

  it("does not return a partial-name match — only an exact match", async () => {
    fetchFromReactor.mockResolvedValueOnce(
      makeResponse([makeDE("My Variable 2024", "DE1")], null),
    );

    const result = await fetchDataElementByName({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
      name: "My Variable",
    });

    expect(result).toBeUndefined();
  });

  it("returns undefined when no data element with that name exists", async () => {
    fetchFromReactor.mockResolvedValueOnce(makeResponse([], null));

    const result = await fetchDataElementByName({
      orgId: "ORG",
      imsAccess: "TOKEN",
      propertyId: "PR1",
      name: "Nonexistent",
    });

    expect(result).toBeUndefined();
  });
});
