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
import { userEvent } from "vitest/browser";
import { expect } from "vitest";

const TOTAL_RETRIES = [0, 0, 0];
const RETRIES = 3;
// CI runners can starve Chromium enough that even a click event roundtrip
// exceeds the old 2s budget; Increased to 6s to avoid test flakiness in CI
const TIMEOUT = { timeout: 6000 };

/**
 *
 * If the function throws an error, it will be retried up to RETRIES times.
 * If the function succeeds, it will return immediately.
 * If the function fails after all retries, it will throw the last error.
 *
 * Near as I can tell, the regular playwright retry mechanism will sometimes get the element from the previous react render,
 * so when doing a normal playwright action, sometimes it will get the old element, but when it sees that the element has been removed
 * from the DOM, it will stop retrying and fail. By using retries, we can ensure that this doesn't happen. Also multi-step actions
 * can be retried from the first step, rather than just retrying the last step. I also do not use expect.poll or expect.waitFor
 * here because they seem to have problems running expect.element or locator actions.
 *
 * @param {() => Promise<void>} fn - The function to run with retries.
 * @returns {Promise<void>} - Resolved when the function succeeds or rejected when the function fails after all retries.
 */
const withRetries = async (fn) => {
  for (let i = 0; i < RETRIES; i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await fn();
      return result;
    } catch (error) {
      TOTAL_RETRIES[i] += 1;
      if (i === RETRIES - 1) {
        throw error;
      }
    }
  }
  return undefined;
};

// S2 TextField/TextArea/NumberField forward `data-test-id` to their outer
// react-aria-components wrapper, not the native <input>/<textarea> it renders
// (v3 forwarded it straight to the control). Interactions that need a real
// form control drill down to it when the located element isn't already one.
const asControl = (locator) => {
  const tagName = locator.element().tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return locator;
  }
  return locator.locator("input, textarea, select").first();
};

// Same story for S2 Checkbox/Radio: `data-test-id` lands on the outer
// <label>, which jest-dom's toBeChecked()/aria-checked assertions reject.
const asCheckable = (locator) => {
  const el = locator.element();
  const isCheckableInput =
    el.tagName.toLowerCase() === "input" &&
    (el.type === "checkbox" || el.type === "radio");
  if (isCheckableInput || el.hasAttribute("aria-checked")) {
    return locator;
  }
  return locator
    .locator('input[type="checkbox"], input[type="radio"], [aria-checked]')
    .first();
};

// Same story for S2 Picker/ComboBox: `data-test-id` lands on the outer
// field wrapper, not the trigger button (Picker) or input (ComboBox) that
// actually carries aria-expanded/aria-controls.
const asTrigger = (locator) => {
  const tagName = locator.element().tagName.toLowerCase();
  if (tagName === "input" || tagName === "button") {
    return locator;
  }
  return locator.locator("input, button").first();
};

// isDisabled/isEnabled apply to every field type, including button-based
// ones (Picker/ComboBox triggers) that have no nested control at all - so
// unlike asControl/asCheckable, fall back to the original locator instead
// of assuming a control exists.
const preferControl = (locator) => {
  const tagName = locator.element().tagName.toLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") {
    return locator;
  }
  const nested = locator.locator("input, textarea, select").first();
  return nested.query() ? nested : locator;
};

// Native checkbox/radio inputs report their state via the `checked`
// property, not an `aria-checked` attribute (that's only for custom,
// non-native role="checkbox"/"radio" elements).
const isChecked = (el) => {
  if (
    el.tagName.toLowerCase() === "input" &&
    (el.type === "checkbox" || el.type === "radio")
  ) {
    return el.checked;
  }
  return el.getAttribute("aria-checked") === "true";
};

const field = (locator) => ({
  // Actions:
  // ================================
  blur: async () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).toBeVisible();
      asControl(locator).element().blur();
      await expect.element(asControl(locator), TIMEOUT).not.toHaveFocus();
    }),
  check: async () =>
    withRetries(async () => {
      if (!isChecked(asCheckable(locator).element())) {
        await locator.click(TIMEOUT);
        await expect.element(asCheckable(locator), TIMEOUT).toBeChecked();
      }
    }),
  clear: async () =>
    withRetries(async () => {
      await asControl(locator).clear(TIMEOUT);
      await userEvent.tab();
      await expect.element(asControl(locator), TIMEOUT).toHaveValue("");
    }),
  click: async (options) =>
    withRetries(async () => {
      await locator.click({ ...TIMEOUT, ...options });
    }),
  collapse: async () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).toBeVisible();
      if (!locator.element().hasAttribute("aria-expanded")) {
        throw new Error("aria-expanded attribute not found on element");
      }
      if (locator.element().getAttribute("aria-expanded") !== "false") {
        await locator.click(TIMEOUT);
        await expect
          .element(locator, TIMEOUT)
          .toHaveAttribute("aria-expanded", "false");
      }
    }),
  expand: async () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).toBeVisible();
      if (!locator.element().hasAttribute("aria-expanded")) {
        throw new Error("aria-expanded attribute not found on element");
      }
      if (locator.element().getAttribute("aria-expanded") !== "true") {
        await locator.click(TIMEOUT);
        await expect
          .element(locator, TIMEOUT)
          .toHaveAttribute("aria-expanded", "true");
      }
    }),
  fill: async (value) =>
    withRetries(async () => {
      await asControl(locator).fill(value, TIMEOUT);
      asControl(locator).element().blur();
      await expect.element(asControl(locator), TIMEOUT).toHaveValue(value);
    }),
  focus: async () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).toBeVisible();
      asControl(locator).element().focus();
      await expect.element(asControl(locator), TIMEOUT).toHaveFocus();
    }),
  scrollIntoView: () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).toBeVisible();
      locator.element().scrollIntoView();
    }),
  selectOption: async (name) =>
    withRetries(async () => {
      const trigger = asTrigger(locator);
      if (trigger.element().getAttribute("aria-expanded") === "false") {
        const isComboBox = trigger.element().tagName.toLowerCase() === "input";
        // The dropdown toggle button lives elsewhere in the ComboBox's own
        // field wrapper, not the trigger input itself; scope the search to
        // the original (outer) locator so it can't match an unrelated
        // sibling button (e.g. a "Select data element" button next to it).
        const button = isComboBox ? locator.getByRole("button") : trigger;
        await button.click(TIMEOUT);
        await expect
          .element(trigger, TIMEOUT)
          .toHaveAttribute("aria-expanded", "true");
      }
      const listbox = trigger.controls();
      await expect.element(listbox, TIMEOUT).toBeVisible();
      const option = listbox.getByRole("option", { name, exact: true }).nth(0);
      await expect.element(option, TIMEOUT).toBeVisible();
      if (option.element().getAttribute("aria-selected") === "true") {
        // Clicking an already-selected option races with the closing menu
        // animation; close it explicitly so the post-click assertions are
        // deterministic. Selection is unchanged.
        await userEvent.keyboard("{Escape}");
      } else {
        await option.click(TIMEOUT);
      }
      await expect
        .element(trigger, TIMEOUT)
        .toHaveAttribute("aria-expanded", "false");
      if (trigger.element().tagName.toLowerCase() === "input") {
        await expect.element(trigger, TIMEOUT).toHaveValue(name);
      } else {
        await expect.element(trigger, TIMEOUT).toHaveTextContent(name);
      }
    }),
  uncheck: async () =>
    withRetries(async () => {
      if (isChecked(asCheckable(locator).element())) {
        await locator.click(TIMEOUT);
        await expect.element(asCheckable(locator), TIMEOUT).not.toBeChecked();
      }
    }),
  // Expectations:
  // ================================
  expectChecked: async () =>
    withRetries(async () => {
      await expect.element(asCheckable(locator), TIMEOUT).toBeChecked();
    }),
  expectDisabled: async () =>
    withRetries(async () => {
      await expect.element(preferControl(locator), TIMEOUT).toBeDisabled();
    }),
  expectEnabled: async () =>
    withRetries(async () => {
      await expect.element(preferControl(locator), TIMEOUT).not.toBeDisabled();
    }),
  expectExpanded: async () =>
    withRetries(async () => {
      await expect
        .element(locator, TIMEOUT)
        .toHaveAttribute("aria-expanded", "true");
    }),
  expectError: async (message) =>
    withRetries(async () => {
      await expect.element(asControl(locator), TIMEOUT).not.toBeValid();
      await expect
        .element(asControl(locator), TIMEOUT)
        .toHaveAccessibleDescription(message);
    }),
  expectFocus: async () =>
    withRetries(async () => {
      await expect.element(asControl(locator), TIMEOUT).toHaveFocus();
    }),
  expectHidden: async () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).not.toBeInTheDocument();
    }),
  expectInViewport: async () =>
    withRetries(async () => {
      const rect = locator.element().getBoundingClientRect();
      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight + 100);
    }),
  expectNotSelected: async () =>
    withRetries(async () => {
      await expect
        .element(locator, TIMEOUT)
        .not.toHaveAttribute("aria-selected", "true");
    }),
  expectSelected: async () =>
    withRetries(async () => {
      await expect
        .element(locator, TIMEOUT)
        .toHaveAttribute("aria-selected", "true");
    }),
  expectUnchecked: async () =>
    withRetries(async () => {
      await expect.element(asCheckable(locator), TIMEOUT).not.toBeChecked();
    }),
  // S2 sets the native `required` attribute whenever `isRequired` is passed,
  // regardless of Formik's touched/error state (v3 only reflected it via
  // aria-required). So an empty required field is natively invalid the
  // moment it renders - use this to assert no error is DISPLAYED to the
  // user yet, rather than expectValid()'s native-constraint check.
  expectNotInvalid: async () =>
    withRetries(async () => {
      await expect
        .element(asControl(locator), TIMEOUT)
        .not.toHaveAttribute("aria-invalid", "true");
    }),
  expectValid: async () =>
    withRetries(async () => {
      await expect.element(asControl(locator), TIMEOUT).toBeValid();
    }),
  expectValue: async (value) =>
    withRetries(async () => {
      // A Picker's trigger is a button that shows the selected label as text,
      // not a value-bearing form control - use whichever asTrigger finds.
      const target = asTrigger(locator);
      if (target.element().tagName.toLowerCase() === "button") {
        await expect.element(target, TIMEOUT).toHaveTextContent(value);
      } else if (value instanceof RegExp) {
        await expect.element(target, TIMEOUT).toBeVisible();
        const el = target.element();
        expect(el.value).toMatch(value);
      } else {
        // It seems the regular toHaveValue does not support regexes.
        await expect.element(target, TIMEOUT).toHaveValue(value);
      }
    }),
  expectVisible: async () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).toBeVisible();
    }),
  // Getters: (try to avoid, but sometimes necessary. i.e. to see if the default value is restored)
  // ================================
  getValue: async () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).toBeVisible();
      const el = locator.element();
      const tagName = el.tagName.toLowerCase();
      if (
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select"
      ) {
        return el.value;
      }
      const control = el.querySelector("input, textarea, select");
      if (control) {
        return control.value;
      }
      return el.textContent ?? "";
    }),
});

field.logTotalRetries = () => {
  if (TOTAL_RETRIES[0] > 0) {
    // eslint-disable-next-line no-console
    console.log(`Retries: ${TOTAL_RETRIES.join(", ")}`);
  }
};

export default field;
