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
  });
});
