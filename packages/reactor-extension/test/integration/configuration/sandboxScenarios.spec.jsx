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
import ConfigurationView from "../../../src/view/configuration/configurationView";
import { worker } from "../helpers/mocks/browser";
import {
  singleSandboxNoDefaultHandlers,
  sandboxUserRegionMissingHandlers,
} from "../helpers/mocks/defaultHandlers";
import field from "../helpers/field";

let view;
let driver;
let cleanup;
let productionSandboxField;
let edgeConfigInputMethodSelectRadio;

describe("Config Sandboxes", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
    productionSandboxField = field(view.getByTestId("productionSandboxField"));
    edgeConfigInputMethodSelectRadio = field(
      view.getByTestId("edgeConfigInputMethodSelectRadio"),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("shows disabled sandbox dropdown when only one non default sandbox is returned", async () => {
    worker.use(...singleSandboxNoDefaultHandlers);
    await driver.init();

    await productionSandboxField.expectDisabled();
  });

  it("shows alert panel when user region is missing", async () => {
    worker.use(...sandboxUserRegionMissingHandlers);
    await driver.init();

    await edgeConfigInputMethodSelectRadio.click();

    await expect
      .element(
        view.getByRole("heading", {
          name: /you do not have enough permissions to fetch the organization configurations/i,
        }),
      )
      .toBeVisible();
  });

  describe("PDCL-17391: only the production sandbox remains", () => {
    const datastreamSettings = {
      name: "alloy",
      edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
      stagingEdgeConfigId: "0a106b4d-1937-4196-a64d-4a324e972459",
      developmentEdgeConfigId: "77469821-5ead-4045-97b6-acfd889ded6b",
    };

    beforeEach(() => {
      worker.use(
        http.get(
          "https://platform.adobe.io/data/foundation/sandbox-management/",
          () =>
            HttpResponse.json({
              sandboxes: [
                {
                  name: "prod",
                  title: "Prod",
                  state: "active",
                  type: "production",
                  region: "VA7",
                  isDefault: true,
                },
              ],
              _page: { limit: 200, count: 1 },
            }),
        ),
      );
    });

    it.each([
      ["a new extension", null],
      [
        "an existing production-only configuration",
        {
          instances: [
            {
              name: "alloy",
              edgeConfigId: datastreamSettings.edgeConfigId,
              sandbox: "prod",
            },
          ],
        },
      ],
      [
        "legacy settings without any sandbox names",
        { instances: [{ ...datastreamSettings }] },
      ],
    ])("shows all three datastream fields for %s", async (_, settings) => {
      await driver.init({ settings });

      await edgeConfigInputMethodSelectRadio.expectChecked();
      await productionSandboxField.expectDisabled();
      await expect
        .element(view.getByTestId("productionDatastreamField"))
        .toBeVisible();
      await expect
        .element(view.getByTestId("stagingDatastreamField"))
        .toBeVisible();
      await expect
        .element(view.getByTestId("developmentDatastreamField"))
        .toBeVisible();
    });

    it.each([
      ["missing", {}],
      [
        "deleted",
        {
          stagingSandbox: "deleted-staging",
          developmentSandbox: "deleted-dev",
        },
      ],
    ])(
      "reproduces missing staging and development fields with %s saved sandbox names",
      async (_, sandboxSettings) => {
        await driver.init({
          settings: {
            instances: [
              { ...datastreamSettings, sandbox: "prod", ...sandboxSettings },
            ],
          },
        });

        await edgeConfigInputMethodSelectRadio.expectChecked();
        await productionSandboxField.expectDisabled();
        await field(view.getByTestId("productionDatastreamField")).expectValue(
          "analytics enabled",
        );
        await expect
          .element(view.getByTestId("stagingDatastreamField"))
          .not.toBeInTheDocument();
        await expect
          .element(view.getByTestId("developmentDatastreamField"))
          .not.toBeInTheDocument();
        await driver
          .expectSettings((settings) => settings.instances[0])
          .toMatchObject(datastreamSettings);
      },
    );
  });
});
