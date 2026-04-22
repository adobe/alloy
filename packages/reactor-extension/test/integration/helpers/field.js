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
const TIMEOUT = { timeout: 2000 };

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

const field = (locator) => ({
  // Actions:
  // ================================
  blur: async () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).toBeVisible();
      locator.element().blur();
      await expect.element(locator, TIMEOUT).not.toHaveFocus();
    }),
  check: async () =>
    withRetries(async () => {
      if (locator.element().getAttribute("aria-checked") !== "true") {
        await locator.click(TIMEOUT);
        await expect
          .element(locator, TIMEOUT)
          .toHaveAttribute("aria-checked", "true");
      }
    }),
  clear: async () =>
    withRetries(async () => {
      await locator.clear(TIMEOUT);
      await userEvent.tab();
      await expect.element(locator, TIMEOUT).toHaveValue("");
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
      await locator.fill(value, TIMEOUT);
      locator.element().blur();
      await expect.element(locator, TIMEOUT).toHaveValue(value);
    }),
  focus: async () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).toBeVisible();
      locator.element().focus();
      await expect.element(locator, TIMEOUT).toHaveFocus();
    }),
  scrollIntoView: () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).toBeVisible();
      locator.element().scrollIntoView();
    }),
  selectOption: async (name) =>
    withRetries(async () => {
      if (locator.element().getAttribute("aria-expanded") === "false") {
        const isComboBox = locator.element().tagName.toLowerCase() === "input";
        const button = isComboBox
          ? locator.locator("xpath=../../..").getByRole("button")
          : locator;
        await button.click(TIMEOUT);
        await expect
          .element(locator, TIMEOUT)
          .toHaveAttribute("aria-expanded", "true");
      }
      const listbox = locator.controls();
      await expect.element(listbox, TIMEOUT).toBeVisible();
      await listbox
        .getByRole("option", { name, exact: true })
        .nth(0)
        .click(TIMEOUT);
      await expect
        .element(locator, TIMEOUT)
        .toHaveAttribute("aria-expanded", "false");
      if (locator.element().tagName.toLowerCase() === "input") {
        await expect.element(locator, TIMEOUT).toHaveValue(name);
      } else {
        await expect.element(locator, TIMEOUT).toHaveTextContent(name);
      }
    }),
  uncheck: async () =>
    withRetries(async () => {
      if (locator.element().getAttribute("aria-checked") !== "false") {
        await locator.click(TIMEOUT);
        await expect
          .element(locator, TIMEOUT)
          .toHaveAttribute("aria-checked", "false");
      }
    }),
  // Expectations:
  // ================================
  expectChecked: async () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).toBeChecked();
    }),
  expectDisabled: async () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).toBeDisabled();
    }),
  expectEnabled: async () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).not.toBeDisabled();
    }),
  expectExpanded: async () =>
    withRetries(async () => {
      await expect
        .element(locator, TIMEOUT)
        .toHaveAttribute("aria-expanded", "true");
    }),
  expectError: async (message) =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).not.toBeValid();
      await expect
        .element(locator, TIMEOUT)
        .toHaveAccessibleDescription(message);
    }),
  expectFocus: async () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).toHaveFocus();
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
      await expect.element(locator, TIMEOUT).not.toBeChecked();
    }),
  expectValid: async () =>
    withRetries(async () => {
      await expect.element(locator, TIMEOUT).toBeValid();
    }),
  expectValue: async (value) =>
    withRetries(async () => {
      if (locator.element().tagName.toLowerCase() === "button") {
        await expect.element(locator, TIMEOUT).toHaveTextContent(value);
      } else if (value instanceof RegExp) {
        await expect.element(locator, TIMEOUT).toBeVisible();
        const el = locator.element();
        expect(el.value).toMatch(value);
      } else {
        // It seems the regular toHaveValue does not support regexes.
        await expect.element(locator, TIMEOUT).toHaveValue(value);
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
      if (
        el.tagName.toLowerCase() === "input" ||
        el.tagName.toLowerCase() === "textarea"
      ) {
        return el.value;
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
