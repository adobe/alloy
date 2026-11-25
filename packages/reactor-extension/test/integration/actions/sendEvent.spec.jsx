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
import runInstanceNameOptionsTest from "../helpers/actions/instanceNameOptionsTest";
import { instances, LONG_TEST_TIMEOUT } from "../helpers/actions/fixtures";
import {
  buildEdgeConfigOverrides,
  configOverridesInstance,
  enableProductionOverrides,
  expectAllEnvironmentOverrides,
  mockConfigOverridesDatastream,
  selectBlackbirdOverrides,
  selectEnvironmentTab,
  typeAllEnvironmentOverrides,
  typedOverrideValues,
} from "../helpers/actions/configOverrides";

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

  describe("validation", () => {
    const extensionSettings = {
      instances: [{ name: "alloy", edgeConfigId: "PR123" }],
      components: { personalization: true },
    };

    const idSyncOverride = (idSyncContainerId) => ({
      instanceName: "alloy",
      edgeConfigOverrides: {
        development: {
          enabled: true,
          com_adobe_identity: { idSyncContainerId },
        },
      },
    });

    it("accepts a numeric ID sync container override", async () => {
      await driver.init({ extensionSettings, settings: idSyncOverride(123) });

      await driver.expectValidate().toBe(true);
    });

    it.each([
      ["request personalization", undefined],
      ["collect analytics", "guidedEventcollectOption"],
    ])(
      "only accepts a data element ID sync container override for guided %s events",
      async (_, guidedEventOption) => {
        await driver.init({ extensionSettings, settings: idSyncOverride(123) });
        await field(view.getByTestId("guidedEventsEnabledCheckbox")).click();
        if (guidedEventOption) {
          await field(view.getByTestId(guidedEventOption)).click();
        }

        await driver.expectValidate().toBe(false);
        await field(view.getByTestId("idSyncContainerOverride")).expectError(
          /please enter a number/i,
        );
      },
    );

    it("rejects an invalid surface", async () => {
      await driver.init({
        extensionSettings,
        settings: { instanceName: "alloy", surfaces: ["ftp://example.com"] },
      });

      await driver.expectValidate().toBe(false);
      await field(view.getByTestId("surfaces0Field")).expectError(
        /unsupported surface type ftp/i,
      );
    });

    it("requires the XDM to be a data element", async () => {
      await driver.init({
        extensionSettings,
        settings: { instanceName: "alloy", xdm: "not a data element" },
      });

      await driver.expectValidate().toBe(false);
      await field(view.getByTestId("xdmTextField")).expectError(
        /please specify a data element/i,
      );
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

    describe("with a data element", () => {
      const advertisingExtensionSettings = {
        instances: [{ name: "alloy", edgeConfigId: "PR123" }],
        components: { advertising: true },
      };
      let handleAdvertisingDataElementOption;
      let handleAdvertisingDataElementField;

      beforeEach(() => {
        handleAdvertisingDataElementOption = field(
          view.getByTestId("handleAdvertisingDataDataElement"),
        );
        handleAdvertisingDataElementField = field(
          view.getByTestId("handleAdvertisingDataDataElementField"),
        );
      });

      it("saves advertising settings when using data element", async () => {
        await driver.init({ extensionSettings: advertisingExtensionSettings });

        await handleAdvertisingDataElementOption.click();
        await handleAdvertisingDataElementOption.expectChecked();
        await handleAdvertisingDataElementField.fill("%myAdvertisingData%");

        await driver.expectValidate().toBe(true);
        await driver.expectSettings().toEqual({
          instanceName: "alloy",
          advertising: { handleAdvertisingData: "%myAdvertisingData%" },
        });
      });

      it("loads existing advertising settings - data element", async () => {
        await driver.init({
          extensionSettings: advertisingExtensionSettings,
          settings: {
            instanceName: "alloy",
            advertising: { handleAdvertisingData: "%myAdvertisingData%" },
          },
        });

        await handleAdvertisingDataElementOption.expectChecked();
        await handleAdvertisingDataElementField.expectValue(
          "%myAdvertisingData%",
        );
        await handleAdvertisingDataDisabledOption.expectUnchecked();
        await handleAdvertisingDataAutoOption.expectUnchecked();
        await handleAdvertisingDataWaitOption.expectUnchecked();
      });

      it("shows error for advertising data element value that is not a data element", async () => {
        await driver.init({ extensionSettings: advertisingExtensionSettings });

        await handleAdvertisingDataElementOption.click();
        await handleAdvertisingDataElementField.fill("notADataElement");

        await driver.expectValidate().toBe(false);
        await handleAdvertisingDataElementField.expectError(
          /please specify a data element/i,
        );
      });
    });

    it("allows advertising settings with other personalization settings", async () => {
      await driver.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
      });

      await handleAdvertisingDataAutoOption.click();
      await field(view.getByTestId("renderDecisionsCheckbox")).click();
      await field(view.getByTestId("decisionScopesDataElementOption")).click();
      await field(view.getByTestId("decisionScopesDataElementField")).fill(
        "%myScopes%",
      );

      await driver.expectValidate().toBe(true);
      await driver.expectSettings().toEqual({
        instanceName: "alloy",
        renderDecisions: true,
        personalization: { decisionScopes: "%myScopes%" },
        advertising: { handleAdvertisingData: "auto" },
      });
    });
  });
  describe("form", () => {
    const mockExtensionSettings = {
      instances,
      components: { advertising: true },
    };
    const get = (testId) => field(view.getByTestId(testId));
    const decisionScopes = (index) => ({
      value: get(`decisionScopes${index}Field`),
      deleteButton: get(`decisionScopes${index}RemoveButton`),
    });
    const surfaces = (index) => ({
      value: get(`surfaces${index}Field`),
      deleteButton: get(`surfaces${index}RemoveButton`),
    });

    it("renders XDM documentation links inline", async () => {
      await driver.init({ extensionSettings: mockExtensionSettings });

      await expect.element(view.getByText("XDM Object")).toBeVisible();
      for (const fragment of ["#xdm-object", "#merged-objects"]) {
        const link = document.querySelector(`a[href*='${fragment}']`);
        const { display, fontSize } = getComputedStyle(link);
        expect(display).toBe("inline");
        // How many lines a link wraps onto depends on the font, so the number
        // of rects is not asserted; an inline link never makes a rect taller
        // than a line, though.
        for (const rect of link.getClientRects()) {
          expect(rect.height).toBeLessThan(2 * parseFloat(fontSize));
        }
      }
    });

    it(
      "initializes form fields with full settings, when decision scopes is data element",
      async () => {
        const overrideValues = {
          datastreamId: instances[0].edgeConfigId,
          sandbox: "prod",
          datasetId: "6336ff95ba16ca1c07b4c0db",
          idSyncContainerId: 23512312,
          propertyToken: "01dbc634-07c1-d8f9-ca69-b489a5ac5e94",
          reportSuites: ["unifiedjsqeonly2"],
        };
        await driver.init({
          extensionSettings: mockExtensionSettings,
          settings: {
            instanceName: "alloy2",
            type: "myType1",
            xdm: "%myDataLayer%",
            data: "%myData%",
            mergeId: "%myMergeId%",
            personalization: {
              decisionScopes: "%myDecisionScope%",
              surfaces: "%mySurface%",
            },
            documentUnloading: true,
            renderDecisions: true,
            edgeConfigOverrides: buildEdgeConfigOverrides(overrideValues, {
              withEnabled: false,
            }),
          },
        });

        await get("instanceNamePicker").expectValue("alloy2");
        await get("typeField").expectValue("myType1");
        await get("xdmTextField").expectValue("%myDataLayer%");
        await get("dataTextField").expectValue("%myData%");
        await get("mergeIdTextField").expectValue("%myMergeId%");
        await get("documentUnloadingCheckbox").expectChecked();
        await get("renderDecisionsCheckbox").expectChecked();
        await get("decisionScopesDataElementOption").expectChecked();
        await get("decisionScopesFormOption").expectUnchecked();
        await get("decisionScopesDataElementField").expectValue(
          "%myDecisionScope%",
        );
        await get("surfacesDataElementOption").expectChecked();
        await get("surfacesFormOption").expectUnchecked();
        await get("surfacesDataElementField").expectValue("%mySurface%");
        await expectAllEnvironmentOverrides(view, overrideValues);
        await driver.expectValidate().toBe(true);
      },
      LONG_TEST_TIMEOUT,
    );

    it.each([
      [
        "legacy decision scopes form fields, when decision scopes is an array of scopes",
        {
          decisionScopes: ["foo1", "foo2", "foo3"],
          personalization: {
            surfaces: ["web://bar1", "web://bar2", "web://bar3"],
          },
        },
      ],
      [
        "decision scopes and surfaces form fields, when these are arrays",
        {
          personalization: {
            decisionScopes: ["foo1", "foo2", "foo3"],
            surfaces: ["web://bar1", "web://bar2", "web://bar3"],
          },
        },
      ],
    ])("initializes %s", async (_, settings) => {
      await driver.init({
        extensionSettings: mockExtensionSettings,
        settings: { instanceName: "alloy1", ...settings },
      });

      await get("decisionScopesFormOption").expectChecked();
      await get("decisionScopesDataElementField").expectHidden();
      for (const [index, value] of ["foo1", "foo2", "foo3"].entries()) {
        // eslint-disable-next-line no-await-in-loop
        await decisionScopes(index).value.expectValue(value);
      }
      await get("surfacesFormOption").expectChecked();
      await get("surfacesDataElementField").expectHidden();
      for (const [index, value] of [
        "web://bar1",
        "web://bar2",
        "web://bar3",
      ].entries()) {
        // eslint-disable-next-line no-await-in-loop
        await surfaces(index).value.expectValue(value);
      }
      await driver.expectValidate().toBe(true);
    });

    it("initializes form fields with minimal settings", async () => {
      await driver.init({
        extensionSettings: mockExtensionSettings,
        settings: { instanceName: "alloy1" },
      });

      await get("instanceNamePicker").expectValue("alloy1");
      await get("typeField").expectValue("");
      await get("xdmTextField").expectValue("");
      await get("dataTextField").expectValue("");
      await get("mergeIdTextField").expectValue("");
      await get("decisionScopesFormOption").expectChecked();
      await get("documentUnloadingCheckbox").expectUnchecked();
      await get("renderDecisionsCheckbox").expectUnchecked();
      await get("decisionScopesDataElementOption").expectUnchecked();
      await decisionScopes(0).value.expectValue("");
      await get("surfacesDataElementOption").expectUnchecked();
      await surfaces(0).value.expectValue("");
    });

    it("initializes form fields with no settings", async () => {
      await driver.init({ extensionSettings: mockExtensionSettings });

      await get("instanceNamePicker").expectValue("alloy1");
      await get("typeField").expectValue("");
      await get("xdmTextField").expectValue("");
      await get("dataTextField").expectValue("");
      await get("mergeIdTextField").expectValue("");
      await get("documentUnloadingCheckbox").expectUnchecked();
      await get("renderDecisionsCheckbox").expectUnchecked();
      await get("decisionScopesFormOption").expectChecked();
      await get("decisionScopesDataElementOption").expectUnchecked();
      await decisionScopes(0).value.expectValue("");
      await get("surfacesFormOption").expectChecked();
      await get("surfacesDataElementOption").expectUnchecked();
      await surfaces(0).value.expectValue("");
      await get("overridesEnabled").expectValue("No override");
    });

    it("returns minimal valid settings", async () => {
      await driver.init({ extensionSettings: mockExtensionSettings });

      await driver.expectValidate().toBe(true);
      await driver.expectSettings().toEqual({ instanceName: "alloy1" });
    });

    it(
      "returns full valid settings with decision scopes as data element",
      async () => {
        const overrideValues = typedOverrideValues;
        await driver.init({ extensionSettings: mockExtensionSettings });

        await get("instanceNamePicker").selectOption("alloy2");
        await get("typeField").fill("mytype1");
        await get("xdmTextField").fill("%myDataLayer%");
        await get("dataTextField").fill("%myData%");
        await get("mergeIdTextField").fill("%myMergeId%");
        await get("documentUnloadingCheckbox").click();
        await get("renderDecisionsCheckbox").click();
        await get("decisionScopesDataElementOption").click();
        await get("decisionScopesDataElementField").fill("%myScope%");
        await get("surfacesDataElementOption").click();
        await get("surfacesDataElementField").fill("%mySurface%");
        await driver.expectValidate().toBe(true);
        await typeAllEnvironmentOverrides(view, overrideValues);

        await driver.expectValidate().toBe(true);
        await driver.expectSettings().toEqual({
          instanceName: "alloy2",
          type: "mytype1",
          xdm: "%myDataLayer%",
          data: "%myData%",
          mergeId: "%myMergeId%",
          documentUnloading: true,
          renderDecisions: true,
          personalization: {
            decisionScopes: "%myScope%",
            surfaces: "%mySurface%",
          },
          edgeConfigOverrides: buildEdgeConfigOverrides(overrideValues),
        });
      },
      LONG_TEST_TIMEOUT,
    );

    it("returns decision scopes settings as an array", async () => {
      await driver.init({ extensionSettings: mockExtensionSettings });

      await get("decisionScopesFormOption").click();
      await decisionScopes(0).value.fill("foo");
      await get("decisionScopesAddButton").click();
      await decisionScopes(1).value.fill("foo1");
      await get("decisionScopesAddButton").click();
      await decisionScopes(2).value.fill("foo2");
      await decisionScopes(1).deleteButton.click();

      await driver.expectValidate().toBe(true);
      await driver.expectSettings().toEqual({
        instanceName: "alloy1",
        personalization: { decisionScopes: ["foo", "foo2"] },
      });
    });

    it("returns surfaces settings as an array", async () => {
      await driver.init({ extensionSettings: mockExtensionSettings });

      await get("surfacesFormOption").click();
      await surfaces(0).value.fill("web://foo");
      await get("surfacesAddButton").click();
      await surfaces(1).value.fill("web://foo1");
      await get("surfacesAddButton").click();
      await surfaces(2).value.fill("web://foo2");
      await surfaces(1).deleteButton.click();

      await driver.expectValidate().toBe(true);
      await driver.expectSettings().toEqual({
        instanceName: "alloy1",
        personalization: { surfaces: ["web://foo", "web://foo2"] },
      });
    });

    it.each([
      ["decision scopes", "decisionScopes"],
      ["surface", "surfaces"],
    ])(
      "does not return %s settings when provided with array of empty strings",
      async (_, name) => {
        await driver.init({ extensionSettings: mockExtensionSettings });

        await get(`${name}FormOption`).click();
        await get(`${name}AddButton`).click();
        await get(`${name}AddButton`).click();

        await driver.expectValidate().toBe(true);
        await driver.expectSettings().toEqual({ instanceName: "alloy1" });
      },
    );

    it("shows error for data value that is not a data element", async () => {
      await driver.init({ extensionSettings: mockExtensionSettings });

      await get("dataTextField").fill("myData");

      await driver.expectValidate().toBe(false);
      await get("dataTextField").expectError(/please specify a data element/i);
    });

    it.each([
      ["data", "dataTextField"],
      ["xdm", "xdmTextField"],
    ])(
      "shows error for %s value that is more than one data element",
      async (_, testId) => {
        await driver.init({ extensionSettings: mockExtensionSettings });

        await get(testId).fill("%a%%b%");

        await driver.expectValidate().toBe(false);
        await get(testId).expectError(/please specify a data element/i);
      },
    );

    it.each([
      ["decision scope", "decisionScopes", "fooScope"],
      ["surface", "surfaces", "fooSurface"],
    ])(
      "shows error for %s value that is not a data element",
      async (_, name, value) => {
        await driver.init({ extensionSettings: mockExtensionSettings });

        await get(`${name}DataElementOption`).click();
        await get(`${name}DataElementField`).fill(value);

        await driver.expectValidate().toBe(false);
        await get(`${name}DataElementField`).expectError(
          /please specify a data element/i,
        );
      },
    );

    it(
      "populates overrides dropdowns with Blackbird config data",
      async () => {
        mockConfigOverridesDatastream();
        await driver.init({
          extensionSettings: { instances: [configOverridesInstance] },
        });

        await enableProductionOverrides(view);
        const expectedOverrides = await selectBlackbirdOverrides(view);

        await driver.expectValidate().toBe(true);
        await driver
          .expectSettings((settings) => settings.edgeConfigOverrides)
          .toEqual({ production: expectedOverrides });
      },
      LONG_TEST_TIMEOUT,
    );

    it(
      "overrides switch to text fields when the second instance is selected",
      async () => {
        mockConfigOverridesDatastream();
        const environmentIds = (edgeConfigId, sandbox) => ({
          edgeConfigId,
          sandbox,
          stagingEdgeConfigId: edgeConfigId,
          stagingSandbox: sandbox,
          developmentEdgeConfigId: edgeConfigId,
          developmentSandbox: sandbox,
        });
        const expectDatasetField = (role) =>
          expect.element(
            view.getByTestId("eventDatasetOverride").getByRole(role),
          );
        await driver.init({
          extensionSettings: {
            instances: [
              {
                name: "alloy1",
                ...environmentIds(
                  "aca8c786-4940-442f-ace5-7c4aba02118e",
                  "prod",
                ),
              },
              {
                name: "alloy2",
                ...environmentIds(
                  "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
                  "testsandbox1",
                ),
              },
            ],
          },
        });

        await get("instanceNamePicker").expectValue("alloy1");
        await selectEnvironmentTab(view, "development");
        await get("overridesEnabled").selectOption("Enabled");
        await get("datastreamId").expectVisible();
        await get("experiencePlatformEnabled").selectOption("Enabled");
        await expectDatasetField("combobox").toBeVisible();

        await get("instanceNamePicker").selectOption("alloy2");

        await get("overridesEnabled").expectValue("Enabled");
        await get("datastreamId").expectVisible();
        await expectDatasetField("textbox").toBeVisible();
        await expectDatasetField("combobox").not.toBeInTheDocument();
      },
      LONG_TEST_TIMEOUT,
    );
  });

  runInstanceNameOptionsTest({
    openView: () => useView(SendEventView),
    pickerTestId: "instanceNamePicker",
  });
});
