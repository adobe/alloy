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

import { describe, expect, it } from "vitest";
import field from "../field";
import setUpView from "./setUpView";

const expectAlert = (view, testId, isShown) => {
  const alert = expect.element(view.getByTestId(testId));
  return isShown ? alert.toBeInTheDocument() : alert.not.toBeInTheDocument();
};

export const expectRequiredComponentAlerts = async (
  view,
  { error = false, warning = false, preinstalled = false },
) => {
  await expectAlert(view, "requiredComponentError", error);
  await expectAlert(view, "requiredComponentWarning", warning);
  await expectAlert(view, "preinstalledModeWarning", preinstalled);
};

// Asserting that no alert is shown would also pass on an empty render, so the
// form itself is asserted to be there first.
const expectFormShown = (view, formTestId) =>
  expect.element(view.getByTestId(formTestId)).toBeVisible();

/**
 * Port of TestCafe's runCustomBuildTests.mjs. Registers the three tests every
 * action built on `requiredComponent` shares.
 *
 * @param {object} options
 * @param {() => Promise<{ view, driver, cleanup }>} options.openView
 * Renders a fresh copy of the action view (typically `() => useView(View)`).
 * @param {string} options.requiredComponent camelCased component name.
 * @param {object} options.minimumValidSettings Settings of an existing action.
 * @param {string} options.formTestId data-test-id of a field that is rendered
 * whenever the form is shown.
 * @param {boolean} [options.blocksNewAction] Whether creating a new action is
 * also rejected by validation. KNOWN SRC GAP when false: views that render the
 * RequiredComponent component directly (instead of the requiredComponent form
 * part) show the error alert but still validate, so the new action can be
 * saved. The tests assert that current behavior; flip this to true when fixed.
 */
export const runRequiredComponentTests = ({
  openView,
  requiredComponent,
  minimumValidSettings,
  formTestId,
  blocksNewAction = true,
}) => {
  describe(`required ${requiredComponent} component`, () => {
    const opened = setUpView(openView);
    const init = (componentEnabled, settings) =>
      opened.driver.init({
        extensionSettings: {
          instances: [{ name: "alloy" }],
          components: { [requiredComponent]: componentEnabled },
        },
        settings,
      });

    const newActionTitle = blocksNewAction
      ? "prevents you from creating when the required component is excluded"
      : "currently validates a new action despite the required-component error (known gap)";
    // The title depends on whether the known src gap applies.
    // eslint-disable-next-line vitest/valid-title
    it(newActionTitle, async () => {
      await init(false, null);

      await expectRequiredComponentAlerts(opened.view, { error: true });
      await opened.driver.expectValidate().toBe(!blocksNewAction);
    });

    it("allows you to save when the required component is excluded", async () => {
      await init(false, minimumValidSettings);

      await expectFormShown(opened.view, formTestId);
      await expectRequiredComponentAlerts(opened.view, { warning: true });
      await opened.driver.expectValidate().toBe(true);
    });

    it("shows no alerts when the required component is included", async () => {
      await init(true, minimumValidSettings);

      await expectFormShown(opened.view, formTestId);
      await expectRequiredComponentAlerts(opened.view, {});
      await opened.driver.expectValidate().toBe(true);
    });
  });
};

/**
 * Port of the preinstalled/managed library tests in the TestCafe
 * resetEventMergeId spec. In a preinstalled (self-hosted) build the form always
 * shows a notice instead of the required-component error or warning.
 *
 * @param {object} options
 * @param {string} options.formTestId data-test-id of a field rendered whenever
 * the form is shown.
 * @param {RegExp} options.newActionError Error expected on that field once a
 * new (empty) action is validated.
 */
export const runLibraryTypeTests = ({
  openView,
  minimumValidSettings,
  formTestId,
  newActionError,
}) => {
  describe("library type", () => {
    const opened = setUpView(openView);
    const init = (libraryType, settings) =>
      opened.driver.init({
        extensionSettings: {
          libraryCode: { type: libraryType },
          instances: [{ name: "alloy" }],
        },
        settings,
      });

    it("shows the self-hosted notice when using preinstalled library type and creating a new action", async () => {
      await init("preinstalled", null);

      await expectFormShown(opened.view, formTestId);
      await expectRequiredComponentAlerts(opened.view, {
        preinstalled: true,
      });
      await opened.driver.expectValidate().toBe(false);
      await field(opened.view.getByTestId(formTestId)).expectError(
        newActionError,
      );
    });

    it("shows the self-hosted notice when using preinstalled library type with an existing action", async () => {
      await init("preinstalled", minimumValidSettings);

      await expectFormShown(opened.view, formTestId);
      await expectRequiredComponentAlerts(opened.view, {
        preinstalled: true,
      });
      await opened.driver.expectValidate().toBe(true);
    });

    it("shows no alerts when using managed library type", async () => {
      await init("managed", minimumValidSettings);

      await expectFormShown(opened.view, formTestId);
      await expectRequiredComponentAlerts(opened.view, {});
      await opened.driver.expectValidate().toBe(true);
    });
  });
};
