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
import useView from "../helpers/useView";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import { buildSettings } from "../helpers/settingsUtils";
import field from "../helpers/field";

let view;
let driver;
let cleanup;
let nameField;
let edgeBasePathField;

describe("useFocusFirstError hook", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
    nameField = field(view.getByTestId("nameField"));
    edgeBasePathField = field(view.getByTestId("edgeBasePathField"));
  });

  afterEach(() => {
    cleanup();
  });

  it("focuses the first invalid field after validation fails", async () => {
    await driver.init(buildSettings());

    // Clear the name field to create a validation error
    await nameField.clear();

    // Trigger validation
    await driver.expectValidate().toBe(false);

    // Verify the name field is focused and has an error
    await nameField.expectFocus();
    await nameField.expectError(/please specify a name/i);
  });

  it("focuses the first error in a different tab when validation fails", async () => {
    await driver.init(
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

    await nameField.clear();

    // Switch back to the second tab
    const secondTab = view.getByRole("tab").nth(1);
    await secondTab.click();

    // Trigger validation
    await driver.expectValidate().toBe(false);

    // Verify the first tab is now selected (the hook should have switched to it)
    const firstTab = view.getByRole("tab").nth(0);
    await expect.element(firstTab).toHaveAttribute("aria-selected", "true");

    // Verify the name field is focused
    await nameField.expectFocus();
    await nameField.expectError(/please specify a name/i);
  });

  it("focuses the first error when there are multiple errors", async () => {
    await driver.init();

    // Clear multiple fields to create multiple validation errors
    await nameField.clear();

    await driver.expectValidate().toBe(false);

    await nameField.expectFocus();
    await nameField.expectError(/please specify a name/i);
  });

  it("focuses error field in collapsed accordion after validation fails", async () => {
    await driver.init(
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

    await nameField.clear();

    await view.getByRole("button", { name: "SDK instances" }).click();

    await driver.expectValidate().toBe(false);

    await field(
      view.getByRole("button", { name: "SDK instances" }),
    ).expectExpanded();

    // Verify the name field is focused
    await nameField.expectFocus();
    await nameField.expectError(/please specify a name/i);
  });

  it("scrolls the invalid field into view when it's off-screen", async () => {
    await driver.init(buildSettings());

    // Clear the edge base path field (which is lower on the page)
    await edgeBasePathField.clear();

    // Scroll to the top of the page
    await nameField.scrollIntoView();

    // Trigger validation
    await driver.expectValidate().toBe(false);

    // Verify the field is focused
    await edgeBasePathField.expectFocus();

    // Verify the field was scrolled into view (allow small tolerance for browser chrome)
    await edgeBasePathField.expectInViewport();
  });

  it("does not focus when validation succeeds", async () => {
    await driver.init(buildSettings());

    // Store the currently focused element
    const initialFocusedElement = document.activeElement;

    // Trigger validation (should succeed with default settings)
    await driver.expectValidate().toBe(true);

    // Wait to ensure no focus changes occur
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    // Verify focus hasn't changed
    expect(document.activeElement).toBe(initialFocusedElement);
  });

  it("focuses different field on subsequent validation failures", async () => {
    await driver.init(buildSettings());

    await driver.expectValidate().toBe(true);

    // First validation error - clear name field
    await nameField.clear();

    // Trigger validation
    await driver.expectValidate().toBe(false);

    // Verify name field is focused
    await nameField.expectFocus();

    // Fix the name field
    await nameField.fill("alloy");

    // Create a different validation error - clear edge base path
    await edgeBasePathField.clear();

    // Trigger validation again
    await driver.expectValidate().toBe(false);

    // Verify edge base path field is now focused
    await edgeBasePathField.expectFocus();
  });

  it("focuses field in different instance when switching tabs backwards", async () => {
    await driver.init(
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

    await nameField.clear();

    // Switch to the third tab
    const thirdTab = view.getByRole("tab").nth(2);
    await thirdTab.click();

    // Trigger validation - should switch back to first tab
    await driver.expectValidate().toBe(false);

    // Verify the first tab is selected
    const firstTab = view.getByRole("tab").nth(0);
    await expect.element(firstTab).toHaveAttribute("aria-selected", "true");

    // Verify the name field is focused
    await nameField.expectFocus();
    await nameField.expectError(/please specify a name/i);
  });
});
