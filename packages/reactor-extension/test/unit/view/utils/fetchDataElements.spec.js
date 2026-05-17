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

import fetchDataElements from "../../../../src/view/utils/fetchDataElements";

import fetchFromReactor from "../../../../src/view/utils/fetchFromReactor";

const DELEGATE_DESCRIPTOR_ID = "__EXTENSION_NAME__::dataElements::variable";

const makeResponse = (names, nextPage) => ({
  parsedBody: {
    data: names.map((name, i) => ({
      id: `DE${i}`,
      attributes: {
        name,
        delegate_descriptor_id: DELEGATE_DESCRIPTOR_ID,
        settings: JSON.stringify({ solutions: ["analytics"] }),
      },
    })),
    meta: { pagination: { next_page: nextPage } },
  },
});

describe("fetchDataElements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("default (single-page) behavior", () => {
    it("fetches exactly one page when no multi-page option is provided", async () => {
      fetchFromReactor.mockResolvedValueOnce(
        makeResponse(["Variable A", "Variable B"], 2),
      );

      const { results, nextPage } = await fetchDataElements({
        orgId: "ORG",
        imsAccess: "TOKEN",
        propertyId: "PR1",
      });

      expect(fetchFromReactor).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(2);
      expect(nextPage).toBe(2);
    });

    it("passes the search filter to the API when search is provided", async () => {
      fetchFromReactor.mockResolvedValueOnce(
        makeResponse(["My Variable", "My Variable 2024"], null),
      );

      await fetchDataElements({
        orgId: "ORG",
        imsAccess: "TOKEN",
        propertyId: "PR1",
        search: "My Variable",
      });

      const { params } = fetchFromReactor.mock.calls[0][0];
      expect(params.get("filter[name]")).toBe("CONTAINS My Variable");
    });

    it("starts from the specified page when page parameter is provided", async () => {
      fetchFromReactor.mockResolvedValueOnce(
        makeResponse(["Variable A", "Variable B"], null),
      );

      await fetchDataElements({
        orgId: "ORG",
        imsAccess: "TOKEN",
        propertyId: "PR1",
        page: 3,
      });

      const { params } = fetchFromReactor.mock.calls[0][0];
      expect(params.get("page[number]")).toBe("3");
    });
  });

  describe("minResults option", () => {
    it("fetches additional pages until the accumulated count reaches minResults", async () => {
      fetchFromReactor
        .mockResolvedValueOnce(makeResponse(["Variable A"], 2))
        .mockResolvedValueOnce(makeResponse(["Variable B"], null));

      const { results, nextPage } = await fetchDataElements({
        orgId: "ORG",
        imsAccess: "TOKEN",
        propertyId: "PR1",
        minResults: 2,
      });

      expect(fetchFromReactor).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(2);
      expect(nextPage).toBeNull();
    });

    it("stops as soon as minResults are accumulated even if more pages exist", async () => {
      fetchFromReactor.mockResolvedValueOnce(
        makeResponse(["Variable A", "Variable B"], 2),
      );

      const { results, nextPage } = await fetchDataElements({
        orgId: "ORG",
        imsAccess: "TOKEN",
        propertyId: "PR1",
        minResults: 2,
      });

      expect(fetchFromReactor).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(2);
      expect(nextPage).toBe(2);
    });
  });
});
