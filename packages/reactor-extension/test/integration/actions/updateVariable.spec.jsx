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

import { describe, it, beforeEach, afterEach, expect } from "vitest";
import { http, HttpResponse } from "msw";

import useView from "../helpers/useView";
import UpdateVariableView from "../../../src/view/actions/updateVariableView";
import field from "../helpers/field";
import { worker } from "../helpers/mocks/browser";

const DELEGATE_DESCRIPTOR_ID = "__EXTENSION_NAME__::dataElements::variable";

const mockDataElements = [
  {
    id: "DE123",
    type: "data_elements",
    attributes: {
      name: "My XDM Variable",
      delegate_descriptor_id: DELEGATE_DESCRIPTOR_ID,
      settings: JSON.stringify({
        sandbox: { name: "prod" },
        schema: {
          id: "https://ns.adobe.com/test/schemas/abc123",
          version: "1.0",
        },
      }),
    },
  },
  {
    id: "DE456",
    type: "data_elements",
    attributes: {
      name: "My Data Variable",
      delegate_descriptor_id: DELEGATE_DESCRIPTOR_ID,
      settings: JSON.stringify({
        solutions: ["analytics"],
      }),
    },
  },
];

const dataElementsHandler = http.get(
  "https://reactor.adobe.io/properties/PR1234/data_elements",
  async () => {
    return HttpResponse.json({
      data: mockDataElements,
      meta: {
        pagination: {
          current_page: 1,
          next_page: null,
          prev_page: null,
          total_pages: 1,
          total_count: 2,
        },
      },
    });
  },
);

const singleDataElementHandler = (id, dataElement) =>
  http.get(`https://reactor.adobe.io/data_elements/${id}`, async () => {
    return HttpResponse.json({
      data: dataElement,
    });
  });

let view;
let driver;
let cleanup;

describe("Update Variable action", () => {
  beforeEach(() => {
    worker.use(dataElementsHandler);
  });

  afterEach(() => {
    if (cleanup) cleanup();
    worker.resetHandlers();
  });

  describe("dataElementName handling", () => {
    it("outputs dataElementName in settings when a data element is selected", async () => {
      ({ view, driver, cleanup } = await useView(UpdateVariableView));
      await driver.init({});

      await expect.element(view.getByTestId("dataElementField")).toBeVisible();

      const dataElementField = field(view.getByTestId("dataElementField"));
      await dataElementField.selectOption("My Data Variable");

      await driver
        .expectSettings((s) => s.dataElementName)
        .toBe("My Data Variable");
    });

    it("loads data element by name when dataElementName is in settings", async () => {
      ({ view, driver, cleanup } = await useView(UpdateVariableView));
      await driver.init({
        settings: {
          dataElementName: "My Data Variable",
          data: {},
        },
      });

      await expect.element(view.getByTestId("dataElementField")).toBeVisible();

      const dataElementField = field(view.getByTestId("dataElementField"));
      await dataElementField.expectValue("My Data Variable");
    });

    it("falls back to dataElementId when dataElementName is not found", async () => {
      worker.use(singleDataElementHandler("DE456", mockDataElements[1]));

      ({ view, driver, cleanup } = await useView(UpdateVariableView));
      await driver.init({
        settings: {
          dataElementName: "Nonexistent Variable",
          dataElementId: "DE456",
          data: {},
        },
      });

      await expect.element(view.getByTestId("dataElementField")).toBeVisible();

      const dataElementField = field(view.getByTestId("dataElementField"));
      await dataElementField.expectValue("My Data Variable");
    });

    it("loads data element by dataElementId when dataElementName is not provided (backward compatibility)", async () => {
      worker.use(singleDataElementHandler("DE456", mockDataElements[1]));

      ({ view, driver, cleanup } = await useView(UpdateVariableView));
      await driver.init({
        settings: {
          dataElementId: "DE456",
          data: {},
        },
      });

      await expect.element(view.getByTestId("dataElementField")).toBeVisible();

      const dataElementField = field(view.getByTestId("dataElementField"));
      await dataElementField.expectValue("My Data Variable");
    });

    it("corrects a stale dataElementId on first save when settings have no dataElementName", async () => {
      // Rules copied between properties keep the source property's dataElementId.
      // When dataElementName is absent (pre-feature settings), the view falls back to
      // the ID lookup, which is not property-scoped and still finds the source DE.
      // After this fix the view resolves the name against the current property so
      // that the corrected ID is written on the very first save.
      const staleDE = {
        id: "DE_STALE_FROM_SOURCE",
        type: "data_elements",
        attributes: {
          name: "My Data Variable",
          delegate_descriptor_id: DELEGATE_DESCRIPTOR_ID,
          settings: JSON.stringify({ solutions: ["analytics"] }),
        },
      };

      worker.use(singleDataElementHandler("DE_STALE_FROM_SOURCE", staleDE));

      ({ view, driver, cleanup } = await useView(UpdateVariableView));
      await driver.init({
        settings: {
          dataElementId: "DE_STALE_FROM_SOURCE",
          data: {},
        },
      });

      await expect.element(view.getByTestId("dataElementField")).toBeVisible();

      const dataElementField = field(view.getByTestId("dataElementField"));
      await dataElementField.expectValue("My Data Variable");

      // The stale ID should already be replaced by the current property's DE on first save.
      await driver.expectSettings((s) => s.dataElementId).toBe("DE456");
    });

    it("prefers dataElementName over dataElementId when both are provided", async () => {
      worker.use(singleDataElementHandler("DE123", mockDataElements[0]));

      ({ view, driver, cleanup } = await useView(UpdateVariableView));
      await driver.init({
        settings: {
          dataElementName: "My Data Variable",
          dataElementId: "DE123",
          data: {},
        },
      });

      await expect.element(view.getByTestId("dataElementField")).toBeVisible();

      const dataElementField = field(view.getByTestId("dataElementField"));
      await dataElementField.expectValue("My Data Variable");
    });

    it("finds data element by name when exact match is on a later search result page", async () => {
      // Regression: when 2+ similarly-named variable data elements appear before
      // the exact match in the API response, the name lookup must paginate until
      // it finds the exact match rather than stopping after the first two results.
      const similarDE1 = {
        id: "DE_SIMILAR1",
        type: "data_elements",
        attributes: {
          name: "My Data Variable 2024",
          delegate_descriptor_id: DELEGATE_DESCRIPTOR_ID,
          settings: JSON.stringify({ solutions: ["analytics"] }),
        },
      };
      const similarDE2 = {
        id: "DE_SIMILAR2",
        type: "data_elements",
        attributes: {
          name: "My Data Variable 2025",
          delegate_descriptor_id: DELEGATE_DESCRIPTOR_ID,
          settings: JSON.stringify({ solutions: ["analytics"] }),
        },
      };
      const exactMatchDE = {
        id: "DE_NEW",
        type: "data_elements",
        attributes: {
          name: "My Data Variable",
          delegate_descriptor_id: DELEGATE_DESCRIPTOR_ID,
          settings: JSON.stringify({ solutions: ["analytics"] }),
        },
      };

      worker.use(
        http.get(
          "https://reactor.adobe.io/properties/PR1234/data_elements",
          ({ request }) => {
            const { searchParams } = new URL(request.url);
            const hasFilter = searchParams.get("filter[name]") !== null;
            const page = searchParams.get("page[number]");

            if (hasFilter && page === "2") {
              return HttpResponse.json({
                data: [exactMatchDE],
                meta: {
                  pagination: {
                    current_page: 2,
                    next_page: null,
                    total_pages: 2,
                    total_count: 3,
                  },
                },
              });
            }
            // Initial fetch (no filter) and search page 1: return the two similar DEs.
            // next_page is null for the initial fetch and 2 for the search.
            return HttpResponse.json({
              data: [similarDE1, similarDE2],
              meta: {
                pagination: {
                  current_page: 1,
                  next_page: hasFilter ? 2 : null,
                  total_pages: hasFilter ? 2 : 1,
                  total_count: hasFilter ? 3 : 2,
                },
              },
            });
          },
        ),
      );

      ({ view, driver, cleanup } = await useView(UpdateVariableView));
      await driver.init({
        settings: {
          dataElementName: "My Data Variable",
          dataElementId: "DE_OLD",
          data: {},
        },
      });

      await expect.element(view.getByTestId("dataElementField")).toBeVisible();

      const dataElementField = field(view.getByTestId("dataElementField"));
      await dataElementField.expectValue("My Data Variable");

      // The stale dataElementId should be updated to the new ID when settings are saved.
      await driver.expectSettings((s) => s.dataElementId).toBe("DE_NEW");
    });
  });
});
