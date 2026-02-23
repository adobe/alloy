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
// eslint-disable-next-line import/no-unresolved
import { page } from "vitest/browser";
import renderView from "../helpers/renderView";
import createExtensionBridge from "../helpers/createExtensionBridge";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import { waitForConfigurationViewToLoad } from "../helpers/ui";
import { buildSettings } from "../helpers/settingsUtils";
import { tabs, spectrumTextField, spectrumPicker } from "../helpers/form";

let extensionBridge;

describe("useFocusFirstError hook", () => {
  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  it("focuses the first invalid field after validation fails", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Clear the name field to create a validation error
    const nameField = spectrumTextField("nameField");
    await nameField.fill("");

    // Trigger validation
    expect(await extensionBridge.validate()).toBe(false);

    // Wait for focus to be applied
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    // Verify the name field is focused and has an error
    const nameFieldElement = await nameField.getElement();
    expect(document.activeElement).toBe(nameFieldElement);
    expect(await nameField.hasError()).toBe(true);
  });

  it("focuses the first error in a different tab when validation fails", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
            sandbox: "prod",
          },
          {
            name: "alloy2",
            orgId: "ORG2@AdobeOrg",
            edgeConfigId: "3fdb3763-0507-42ea-8856-e91bf3b64fbb",
            sandbox: "prod",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const nameField = spectrumTextField("nameField");
    await nameField.fill("");

    // Switch back to the second tab
    const secondTab = tabs(1);
    await secondTab.click();

    // Trigger validation
    expect(await extensionBridge.validate()).toBe(false);

    // Wait for the hook to switch tabs and focus the field
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    // Verify the first tab is now selected (the hook should have switched to it)
    const firstTab = tabs(0);
    const firstTabLocator = await firstTab.element();
    const firstTabElement = firstTabLocator.element();
    expect(firstTabElement.getAttribute("aria-selected")).toBe("true");

    // Verify the name field is focused
    const nameFieldElement = await nameField.getElement();
    expect(document.activeElement).toBe(nameFieldElement);
    expect(await nameField.hasError()).toBe(true);
  });

  it("focuses the first error when there are multiple errors", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init();

    await waitForConfigurationViewToLoad(view);

    // Clear multiple fields to create multiple validation errors
    const nameField = spectrumTextField("nameField");
    await nameField.fill("");

    expect(await extensionBridge.validate()).toBe(false);

    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    const productionSandboxField = spectrumPicker("productionSandboxField");
    const nameFieldElement = await nameField.getElement();
    expect(document.activeElement).toBe(nameFieldElement);
    expect(await nameField.hasError()).toBe(true);
    expect(await productionSandboxField.hasError()).toBe(true);
  });

  it("focuses error field in collapsed accordion after validation fails", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
            sandbox: "prod",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const nameField = spectrumTextField("nameField");
    await nameField.fill("");

    await page.getByRole("button", { name: "SDK instances" }).click();

    expect(await extensionBridge.validate()).toBe(false);

    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    const accordionButton = page.getByRole("button", {
      name: "SDK instances",
    });
    expect(accordionButton.element().getAttribute("aria-expanded")).toBe(
      "true",
    );

    // Verify the name field is focused
    const nameFieldElement = await nameField.getElement();
    expect(document.activeElement).toBe(nameFieldElement);
    expect(await nameField.hasError()).toBe(true);
  });

  it("scrolls the invalid field into view when it's off-screen", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Clear the edge base path field (which is lower on the page)
    const edgeBasePathField = spectrumTextField("edgeBasePathField");
    await edgeBasePathField.fill("");

    // Scroll to the top of the page
    window.scrollTo(0, 0);

    // Trigger validation
    expect(await extensionBridge.validate()).toBe(false);

    // Wait for focus and scroll to be applied
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    // Verify the field is focused
    const edgeBasePathFieldElement = await edgeBasePathField.getElement();
    expect(document.activeElement).toBe(edgeBasePathFieldElement);

    // Verify the field is visible in the viewport
    const rect = edgeBasePathFieldElement.getBoundingClientRect();
    expect(rect.top).toBeGreaterThanOrEqual(0);
    expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
  });

  it("does not focus when validation succeeds", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Store the currently focused element
    const initialFocusedElement = document.activeElement;

    // Trigger validation (should succeed with default settings)
    expect(await extensionBridge.validate()).toBe(true);

    // Wait to ensure no focus changes occur
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    // Verify focus hasn't changed
    expect(document.activeElement).toBe(initialFocusedElement);
  });

  it("focuses different field on subsequent validation failures", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    expect(await extensionBridge.validate()).toBe(true);

    // First validation error - clear name field
    const nameField = spectrumTextField("nameField");
    await nameField.fill("");

    // Trigger validation
    expect(await extensionBridge.validate()).toBe(false);

    // Wait for focus
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    // Verify name field is focused
    const nameFieldElement = await nameField.getElement();
    expect(document.activeElement).toBe(nameFieldElement);

    // Fix the name field
    await nameField.fill("alloy");

    // Create a different validation error - clear edge base path
    const edgeBasePathField = spectrumTextField("edgeBasePathField");
    await edgeBasePathField.fill("");

    // Trigger validation again
    expect(await extensionBridge.validate()).toBe(false);

    // Wait for focus
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    // Verify edge base path field is now focused
    const edgeBasePathFieldElement = await edgeBasePathField.getElement();
    expect(document.activeElement).toBe(edgeBasePathFieldElement);
  });

  it("focuses field in different instance when switching tabs backwards", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeConfigId: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
            sandbox: "prod",
          },
          {
            name: "alloy2",
            orgId: "ORG2@AdobeOrg",
            edgeConfigId: "3fdb3763-0507-42ea-8856-e91bf3b64fbb",
            sandbox: "prod",
          },
          {
            name: "alloy3",
            orgId: "ORG3@AdobeOrg",
            edgeConfigId: "4fdb3763-0507-42ea-8856-e91bf3b64fcc",
            sandbox: "prod",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const nameField = spectrumTextField("nameField");
    await nameField.fill("");

    // Switch to the third tab
    const thirdTab = tabs(2);
    await thirdTab.click();

    // Trigger validation - should switch back to first tab
    expect(await extensionBridge.validate()).toBe(false);

    // Wait for tab switch and focus - backwards tab switches need more time
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    // Verify the first tab is selected
    const firstTab = tabs(0);
    const firstTabLocator = await firstTab.element();
    const firstTabElement = firstTabLocator.element();
    expect(firstTabElement.getAttribute("aria-selected")).toBe("true");

    // Verify the name field is focused
    const nameFieldElement = await nameField.getElement();
    expect(document.activeElement).toBe(nameFieldElement);
    expect(await nameField.hasError()).toBe(true);
  });
});
