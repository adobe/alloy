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
import SendEventView from "../../../src/view/actions/sendEventView";
import field from "../helpers/field";
import { worker } from "../helpers/mocks/browser";

let view;
let driver;
let cleanup;
let handleAdvertisingDataDisabledOption;
let handleAdvertisingDataAutoOption;
let handleAdvertisingDataWaitOption;

describe("Send Event Action", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(SendEventView));
    handleAdvertisingDataDisabledOption = field(
      view.getByTestId("handleAdvertisingDatadisabledOption"),
    );
    handleAdvertisingDataAutoOption = field(
      view.getByTestId("handleAdvertisingDataautoOption"),
    );
    handleAdvertisingDataWaitOption = field(
      view.getByTestId("handleAdvertisingDatawaitOption"),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("centers personalization button labels and icons vertically", async () => {
    await driver.init({
      extensionSettings: {
        instances: [{ name: "alloy", edgeConfigId: "PR123" }],
        components: { personalization: true },
      },
    });

    for (const name of ["decisionScopes", "surfaces"]) {
      for (const suffix of ["AddButton", "0RemoveButton"]) {
        const button = view.getByTestId(`${name}${suffix}`).element();
        // Measure the text itself, not the Text slot's padded bounding box.
        const content = button.querySelector("svg") || document.createRange();
        if (content instanceof Range) {
          content.selectNodeContents(button);
        }
        const buttonRect = button.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        expect(
          Math.abs(
            (contentRect.top + contentRect.bottom) / 2 -
              (buttonRect.top + buttonRect.bottom) / 2,
          ),
        ).toBeLessThanOrEqual(1);
      }
    }
  });

  describe("datastream override", () => {
    const extensionSettings = {
      instances: [{ name: "alloy", edgeConfigId: "PR123" }],
      components: {},
    };

    it("chooses a datastream from any sandbox without a sandbox picker", async () => {
      worker.use(
        http.get(
          "https://edge.adobe.io/metadata/namespaces/edge/datasets/datastreams/records/",
          ({ request }) => {
            if (request.headers.get("x-sandbox-name") !== "number-two-prod") {
              return undefined;
            }
            return HttpResponse.json({
              _embedded: {
                records: [
                  {
                    data: { title: "second sandbox datastream" },
                    sandboxName: "number-two-prod",
                    _system: { id: "second-sandbox-datastream-id" },
                  },
                ],
              },
            });
          },
        ),
      );
      await driver.init({ extensionSettings });

      await field(view.getByTestId("overridesEnabled")).selectOption("Enabled");
      await field(view.getByTestId("datastreamId")).selectOption(
        "second sandbox datastream",
      );

      await expect.element(view.getByTestId("sandbox")).not.toBeInTheDocument();
      await driver
        .expectSettings((settings) => settings.edgeConfigOverrides.development)
        .toMatchObject({
          datastreamId: "second-sandbox-datastream-id",
          sandbox: "number-two-prod",
        });
    });

    it("shows a saved override by name, fills in its sandbox, and drops the input method", async () => {
      await driver.init({
        extensionSettings,
        settings: {
          instanceName: "alloy",
          edgeConfigOverrides: {
            development: {
              enabled: true,
              datastreamId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
              datastreamIdInputMethod: "select",
            },
          },
        },
      });

      await field(view.getByTestId("datastreamId")).expectValue(
        "analytics enabled",
      );
      await driver
        .expectSettings((settings) => settings.edgeConfigOverrides.development)
        .toEqual({
          enabled: true,
          datastreamId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
          sandbox: "prod",
        });
    });

    it("sets a data element from the data element selector", async () => {
      await driver.init({ extensionSettings });

      await field(view.getByTestId("overridesEnabled")).selectOption("Enabled");
      await field(view.getByTestId("datastreamId")).selectOption(
        "analytics enabled",
      );
      await field(
        view
          .getByTestId("datastreamId")
          .locator("xpath=..")
          .getByRole("button", { name: "Select data element" }),
      ).click();

      await field(view.getByTestId("datastreamId")).expectValue(
        "%data element name%",
      );
      await driver
        .expectSettings((settings) => settings.edgeConfigOverrides.development)
        .toEqual({ enabled: true, datastreamId: "%data element name%" });
    });

    it("saves a typed data element as entered", async () => {
      await driver.init({ extensionSettings });

      await field(view.getByTestId("overridesEnabled")).selectOption("Enabled");
      await field(view.getByTestId("datastreamId")).fill(
        "%overrideDatastream%",
      );

      await driver
        .expectSettings((settings) => settings.edgeConfigOverrides.development)
        .toEqual({ enabled: true, datastreamId: "%overrideDatastream%" });
    });
  });

  describe("Component visibility based on configuration", () => {
    it("hides advertising section when advertising component is not enabled", async () => {
      await driver.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: {}, // advertising not enabled
        },
      });

      await expect
        .element(
          view.getByText("enable the Advertising component in the custom"),
        )
        .toBeVisible();

      await expect
        .element(view.getByRole("heading", { name: /Advertising/ }))
        .toBeVisible();
    });

    it("shows advertising section when advertising component is enabled", async () => {
      await driver.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: {
            advertising: true,
          },
        },
      });

      await expect
        .element(view.getByRole("heading", { name: /Advertising/ }))
        .toBeVisible();

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      await expect
        .element(
          view.getByText("enable the Advertising component in the custom"),
        )
        .not.toBeInTheDocument();
    });

    it("hides advertising section when advertising component is explicitly disabled", async () => {
      await driver.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: {
            advertising: false,
          },
        },
      });

      await expect
        .element(
          view.getByText("enable the Advertising component in the custom"),
        )
        .toBeVisible();

      await expect
        .element(view.getByRole("heading", { name: /Advertising/ }))
        .toBeVisible();
    });

    it("shows personalization section by default (default component)", async () => {
      await driver.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: {},
        },
      });

      await expect
        .element(view.getByRole("heading", { name: /Personalization/ }))
        .toBeVisible();

      await expect
        .element(
          view.getByText("enable the Personalization component in the custom"),
        )
        .not.toBeInTheDocument();
    });

    it("hides personalization section when explicitly disabled", async () => {
      await driver.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: {
            personalization: false,
          },
        },
      });

      await expect
        .element(view.getByRole("heading", { name: /Personalization/ }))
        .toBeVisible();

      await expect
        .element(
          view
            .getByText("enable the Personalization component in the custom")
            .first(),
        )
        .toBeVisible();
    });
  });

  describe("Advertising settings functionality", () => {
    it("initializes with default disabled value", async () => {
      await driver.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
      });

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      await handleAdvertisingDataDisabledOption.expectChecked();
    });

    it("does not save advertising settings when default disabled value is selected", async () => {
      await driver.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
      });

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      await driver.expectSettings((s) => s.advertising).toBeUndefined();
    });

    it("saves advertising settings when automatic is selected", async () => {
      await driver.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
      });

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      await handleAdvertisingDataAutoOption.click();

      await driver.expectSettings((s) => s.advertising).toBeDefined();
      await driver
        .expectSettings((s) => s.advertising.handleAdvertisingData)
        .toBe("auto");
    });

    it("saves advertising settings when wait is selected", async () => {
      await driver.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
      });

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      await handleAdvertisingDataWaitOption.click();

      await driver.expectSettings((s) => s.advertising).toBeDefined();
      await driver
        .expectSettings((s) => s.advertising.handleAdvertisingData)
        .toBe("wait");
    });

    it("loads existing advertising settings - automatic", async () => {
      await driver.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
        settings: {
          advertising: {
            handleAdvertisingData: "auto",
          },
        },
      });

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      await handleAdvertisingDataAutoOption.expectChecked();
    });

    it("loads existing advertising settings - wait", async () => {
      await driver.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
        settings: {
          advertising: {
            handleAdvertisingData: "wait",
          },
        },
      });

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      await handleAdvertisingDataWaitOption.expectChecked();
    });

    it("removes advertising settings when switching back to disabled", async () => {
      await driver.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
        settings: {
          advertising: {
            handleAdvertisingData: "auto",
          },
        },
      });

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      await handleAdvertisingDataDisabledOption.click();

      await driver.expectSettings((s) => s.advertising).toBeUndefined();
    });
  });
});
