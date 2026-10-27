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
import { buildSettings } from "../helpers/settingsUtils";
import field from "../helpers/field";

let view;
let driver;
let cleanup;

describe("Datastream field actions", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
  });

  afterEach(() => {
    cleanup();
  });

  it("refresh button reloads the datastream list", async () => {
    await driver.init(buildSettings());
    const productionDatastreamField = field(
      view.getByTestId("productionDatastreamField"),
    );
    await productionDatastreamField.expectValue("analytics enabled");

    worker.use(
      http.get(
        "https://edge.adobe.io/metadata/namespaces/edge/datasets/datastreams/records/",
        ({ request }) =>
          HttpResponse.json({
            _embedded: {
              records:
                request.headers.get("x-sandbox-name") === "prod"
                  ? [
                      {
                        data: { title: "new datastream" },
                        sandboxName: "prod",
                        _system: { id: "new-datastream-id" },
                      },
                    ]
                  : [],
            },
          }),
      ),
    );
    const refreshButton = field(
      view.getByRole("button", { name: "Refresh datastreams" }).first(),
    );
    await refreshButton.click();
    await refreshButton.expectEnabled();

    await productionDatastreamField.selectOption("new datastream");
    await driver
      .expectSettings((settings) => settings.instances[0].edgeConfigId)
      .toBe("new-datastream-id");
  });

  it("spaces the data element, refresh, and copy buttons evenly", async () => {
    await driver.init(buildSettings());
    await field(view.getByTestId("productionDatastreamField")).expectVisible();

    const [dataElement, refresh, copy] = [
      "Select data element",
      "Refresh datastreams",
      "Copy datastream ID to clipboard",
    ].map((name) =>
      view
        .getByRole("button", { name })
        .first()
        .element()
        .getBoundingClientRect(),
    );
    expect(refresh.left - dataElement.right).toBe(copy.left - refresh.right);
  });

  it("copy button is enabled only when the field has a value", async () => {
    await driver.init(buildSettings());

    const copyButtons = view.getByRole("button", {
      name: "Copy datastream ID to clipboard",
    });
    await field(copyButtons.nth(0)).expectEnabled();
    await field(copyButtons.nth(1)).expectDisabled();
    await field(copyButtons.nth(2)).expectDisabled();
  });
});
