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

import { expect } from "vitest";
// eslint-disable-next-line import/no-unresolved
import { page, userEvent } from "vitest/browser";

/**
 * Click on an accordion/disclosure button to expand it
 * @param {string} name - The accessible name of the button (text or regex)
 */
export const clickAccordion = async (name) => {
  await page.getByRole("button", { name }).click();
};

/**
 * Helper to interact with Spectrum ComboBox components
 * @param {string} testId - The data-test-id attribute value
 * @returns {Object} Helper methods for ComboBox interaction
 */
export const spectrumComboBox = (testId) => {
  /**
   * Check if combobox is in loading state
   * @returns {boolean} True if combobox is loading
   */
  const isLoading = () => {
    // React Spectrum shows a progress circle when loading
    // Look for the progressbar role within or near the combobox button
    const button = page.getByTestId(testId).element();

    // First check if progressbar is inside the button
    let progressCircle = button.querySelector('[role="progressbar"]');

    // If not found, check if it's a sibling (in case of different structure)
    if (!progressCircle && button.parentElement) {
      progressCircle = button.parentElement.querySelector(
        '[role="progressbar"]',
      );
    }

    return progressCircle !== null;
  };

  return {
    /**
     * Open the combobox dropdown
     */
    open: async () => {
      const button = page.getByTestId(testId);
      await button.click();
    },

    /**
     * Type text into the combobox input
     * @param {string} text - Text to type
     */
    type: async (text) => {
      const input = page.getByTestId(testId);
      await input.type(text);
    },

    /**
     * Clear the combobox and type new text
     * @param {string} text - Text to type
     */
    fill: async (text) => {
      const input = page.getByTestId(testId);
      await input.clear();
      await input.fill(text);
      // Tab away to trigger blur and ensure all handlers complete
      await userEvent.keyboard("{Tab}");
    },

    /**
     * Clear the combobox
     */
    clear: async () => {
      const input = page.getByTestId(testId);
      await input.clear();
    },

    /**
     * Get the current value of the combobox
     * @returns {string} The current value
     */
    getValue: async () => {
      const input = page.getByTestId(testId);
      // Wait for the input to be visible (important when switching tabs)
      await expect.element(input).toBeVisible();
      return input.element().value;
    },

    /**
     * Select an option by its text (opens dropdown and clicks option)
     * @param {string} optionText - The text of the option to select
     */
    selectOption: async (optionText) => {
      const input = page.getByTestId(testId);

      // Wait for the input to be visible (important when switching tabs)
      await expect.element(input).toBeVisible();
      await expect.element(input).toBeEnabled();

      // If the input value is already the option text, return
      if (input.element().value === optionText) {
        return;
      }

      // Click the input to open the dropdown and focus it
      await input.click();

      // Type to filter options (this is how ComboBox works - you type to filter)
      await input.fill(optionText);

      // Wait for the listbox with options to appear using Vitest's built-in waiting
      await expect.element(page.getByRole("listbox")).toBeVisible();

      // Now find and click the matching option
      // First try exact match
      const options = await page.getByRole("option").all();
      for (const option of options) {
        const element = option.element();
        const text = element.textContent?.trim() || "";
        // Try exact match first (case-insensitive)
        if (text.toLowerCase() === optionText.toLowerCase()) {
          // eslint-disable-next-line no-await-in-loop
          await option.click();
          return;
        }
      }

      // If no exact match, try partial match
      for (const option of options) {
        const element = option.element();
        const text = element.textContent?.trim() || "";
        if (text.toLowerCase().includes(optionText.toLowerCase())) {
          // eslint-disable-next-line no-await-in-loop
          await option.click();
          return;
        }
      }

      // If still not found, throw error
      throw new Error(
        `Could not find option with text "${optionText}". Available options: ${options.map((o) => o.element().textContent?.trim()).join(", ")}`,
      );
    },

    /**
     * Check if the combobox is open
     * @returns {boolean} True if combobox dropdown is open
     */
    isOpen: async () => {
      const button = page.getByTestId(testId).element();
      return button.getAttribute("aria-expanded") === "true";
    },

    /**
     * Check if the combobox is disabled
     * @returns {boolean} True if combobox is disabled
     */
    isDisabled: async () => {
      const input = page.getByTestId(testId);
      // Wait for the input to be visible (important when switching tabs)
      await expect.element(input).toBeVisible();
      const element = input.element();
      return (
        element.disabled || element.getAttribute("aria-disabled") === "true"
      );
    },

    /**
     * Check if the combobox has an error
     * @returns {boolean} True if combobox has error
     */
    hasError: async () => {
      const input = page.getByTestId(testId).element();
      return input.getAttribute("aria-invalid") === "true";
    },

    /**
     * Get the error message if present
     * @returns {string|null} The error message or null
     */
    getErrorMessage: async () => {
      const input = page.getByTestId(testId).element();
      const errorId = input.getAttribute("aria-describedby");
      if (!errorId) return null;
      const errorElement = document.getElementById(errorId);
      return errorElement ? errorElement.textContent : null;
    },

    /**
     * Check if a specific option is available in the dropdown
     * @param {string} optionText - The text of the option to check
     * @returns {boolean} True if option exists
     */
    hasOption: async (optionText) => {
      await page.getByTestId(testId).click();
      const option = page.getByRole("option", { name: optionText });
      const exists = await option.query().then((el) => el !== null);
      // Close the combobox
      await userEvent.keyboard("{Escape}");
      return exists;
    },

    /**
     * Get all available options in the combobox
     * @returns {string[]} Array of option texts
     */
    getOptions: async () => {
      await page.getByTestId(testId).click();
      const options = await page.getByRole("option").all();
      const optionTexts = options.map((option) =>
        option.element().textContent.trim(),
      );
      // Close the combobox
      await userEvent.keyboard("{Escape}");
      return optionTexts;
    },

    /**
     * Check if the combobox is required
     * @returns {boolean} True if combobox is required
     */
    isRequired: async () => {
      const input = page.getByTestId(testId).element();
      return input.getAttribute("aria-required") === "true";
    },

    /**
     * Get the placeholder text
     * @returns {string|null} The placeholder text or null
     */
    getPlaceholder: async () => {
      const button = page.getByTestId(testId).element();
      const placeholderElement = button.querySelector(
        '[data-placeholder="true"]',
      );
      return placeholderElement ? placeholderElement.textContent.trim() : null;
    },

    /**
     * Check if combobox is in loading state
     * @returns {boolean} True if combobox is loading
     */
    isLoading,

    /**
     * Wait for the combobox to finish loading
     */
    waitForLoad: async () => {
      await expect.poll(() => !isLoading()).toBeTruthy();
    },

    /**
     * Get the raw input element
     * @returns {HTMLElement} The input element
     */
    getElement: async () => {
      return page.getByTestId(testId).element();
    },
  };
};

/**
 * Helper to interact with Spectrum TextField components
 * @param {string} testId - The data-test-id attribute value
 * @returns {Object} Helper methods for TextField interaction
 */
export const spectrumTextField = (testId) => {
  return {
    /**
     * Type text into the text field
     * @param {string} text - Text to type
     */
    type: async (text) => {
      await page.getByTestId(testId).type(text);
    },

    /**
     * Clear the text field and type new text
     * @param {string} text - Text to type
     */
    fill: async (text) => {
      const input = page.getByTestId(testId);
      // Wait for the input to be visible (important when switching tabs)
      await expect.element(input).toBeVisible();
      await input.clear();
      await input.fill(text);
      // Tab away to trigger blur and ensure all handlers complete
      await userEvent.keyboard("{Tab}");
    },

    /**
     * Clear the text field
     */
    clear: async () => {
      await page.getByTestId(testId).clear();
    },

    /**
     * Get the current value of the text field
     * @returns {string} The current value
     */
    getValue: async () => {
      const input = page.getByTestId(testId);
      // Wait for the input to be visible (important when switching tabs)
      await expect.element(input).toBeVisible();
      return input.element().value;
    },

    /**
     * Check if the text field has an error
     * @returns {boolean} True if field has error
     */
    hasError: async () => {
      return (
        page.getByTestId(testId).element().getAttribute("aria-invalid") ===
        "true"
      );
    },

    /**
     * Get the error message if present
     * @returns {string|null} The error message or null
     */
    getErrorMessage: async () => {
      const element = page.getByTestId(testId).element();
      const errorId = element.getAttribute("aria-describedby");
      if (!errorId) return null;
      const errorElement = document.getElementById(errorId);
      return errorElement ? errorElement.textContent : null;
    },

    /**
     * Check if the text field is disabled
     * @returns {boolean} True if field is disabled
     */
    isDisabled: async () => {
      return page.getByTestId(testId).element().disabled;
    },

    /**
     * Check if the text field is required
     * @returns {boolean} True if field is required
     */
    isRequired: async () => {
      const input = page.getByTestId(testId).element();
      return input.getAttribute("aria-required") === "true";
    },

    /**
     * Get the raw input element
     * @returns {HTMLElement} The input element
     */
    getElement: async () => {
      return page.getByTestId(testId).element();
    },
  };
};

/**
 * Helper to interact with Spectrum NumberField components
 * @param {string} testId - The data-test-id attribute value
 * @returns {Object} Helper methods for NumberField interaction
 */
export const spectrumNumberField = (testId) => {
  return {
    /**
     * Type a number into the number field
     * @param {string|number} value - Number to type
     */
    type: async (value) => {
      await page.getByTestId(testId).type(String(value));
    },

    /**
     * Clear the number field and type a new number
     * @param {string|number} value - Number to type
     */
    fill: async (value) => {
      await page.getByTestId(testId).clear();
      await page.getByTestId(testId).fill(String(value));
      // Tab away to trigger blur and ensure all handlers complete
      await userEvent.keyboard("{Tab}");
    },

    /**
     * Clear the number field
     */
    clear: async () => {
      await page.getByTestId(testId).clear();
    },

    /**
     * Get the current value of the number field
     * @returns {string} The current value
     */
    getValue: async () => {
      return page.getByTestId(testId).element().value;
    },

    /**
     * Get the current value as a number
     * @returns {number|null} The current value as a number, or null if empty
     */
    getNumericValue: async () => {
      const element = page.getByTestId(testId).element();
      const value = element.value;
      return value === "" ? null : Number(value);
    },

    /**
     * Increment the value using the up arrow key
     */
    increment: async () => {
      await page.getByTestId(testId).click();
      await userEvent.keyboard("{ArrowUp}");
      // Tab away to trigger blur and ensure all handlers complete
      await userEvent.keyboard("{Tab}");
    },

    /**
     * Decrement the value using the down arrow key
     */
    decrement: async () => {
      await page.getByTestId(testId).click();
      await userEvent.keyboard("{ArrowDown}");
      // Tab away to trigger blur and ensure all handlers complete
      await userEvent.keyboard("{Tab}");
    },

    /**
     * Check if the number field has an error
     * @returns {boolean} True if field has error
     */
    hasError: async () => {
      return (
        page.getByTestId(testId).element().getAttribute("aria-invalid") ===
        "true"
      );
    },

    /**
     * Get the error message if present
     * @returns {string|null} The error message or null
     */
    getErrorMessage: async () => {
      const element = page.getByTestId(testId).element();
      const errorId = element.getAttribute("aria-describedby");
      if (!errorId) return null;
      const errorElement = document.getElementById(errorId);
      return errorElement ? errorElement.textContent : null;
    },

    /**
     * Check if the number field is disabled
     * @returns {boolean} True if field is disabled
     */
    isDisabled: async () => {
      return page.getByTestId(testId).element().disabled;
    },

    /**
     * Get the raw input element
     * @returns {HTMLElement} The input element
     */
    getElement: async () => {
      return page.getByTestId(testId).element();
    },
  };
};

/**
 * Helper to interact with Spectrum Checkbox components
 * @param {string} testId - The data-test-id attribute value
 * @returns {Object} Helper methods for Checkbox interaction
 */
export const spectrumCheckbox = (testId) => {
  return {
    /**
     * Click the checkbox to toggle its state
     */
    click: async () => {
      await page.getByTestId(testId).click();
    },

    /**
     * Check (select) the checkbox if it's not already checked
     */
    check: async () => {
      const element = page.getByTestId(testId).element();
      if (!element.checked) {
        await page.getByTestId(testId).click();
      }
    },

    /**
     * Uncheck (deselect) the checkbox if it's currently checked
     */
    uncheck: async () => {
      const element = page.getByTestId(testId).element();
      if (element.checked) {
        await page.getByTestId(testId).click();
      }
    },

    /**
     * Check if the checkbox is checked
     * @returns {boolean} True if checkbox is checked
     */
    isChecked: async () => {
      return page.getByTestId(testId).element().checked;
    },

    /**
     * Check if the checkbox has an error
     * @returns {boolean} True if checkbox has error
     */
    hasError: async () => {
      return (
        page.getByTestId(testId).element().getAttribute("aria-invalid") ===
        "true"
      );
    },

    /**
     * Get the error message if present
     * @returns {string|null} The error message or null
     */
    getErrorMessage: async () => {
      const element = page.getByTestId(testId).element();
      const errorId = element.getAttribute("aria-describedby");
      if (!errorId) return null;
      const errorElement = document.getElementById(errorId);
      return errorElement ? errorElement.textContent : null;
    },

    /**
     * Check if the checkbox is disabled
     * @returns {boolean} True if checkbox is disabled
     */
    isDisabled: async () => {
      return page.getByTestId(testId).element().disabled;
    },

    /**
     * Get the raw input element
     * @returns {HTMLElement} The input element
     */
    getElement: async () => {
      return page.getByTestId(testId).element();
    },
  };
};

/**
 * Helper to interact with Spectrum Radio components
 * @param {string} testId - The data-test-id attribute value
 * @returns {Object} Helper methods for Radio interaction
 */
export const spectrumRadio = (testId) => {
  return {
    /**
     * Click the radio button to select it
     */
    click: async () => {
      await page.getByTestId(testId).click();
    },

    /**
     * Select the radio button if it's not already selected
     */
    select: async () => {
      const element = page.getByTestId(testId).element();
      if (!element.checked) {
        await page.getByTestId(testId).click();
      }
    },

    /**
     * Check if the radio button is selected
     * @returns {boolean} True if radio button is selected
     */
    isSelected: async () => {
      return page.getByTestId(testId).element().checked;
    },

    /**
     * Check if the radio button has an error
     * @returns {boolean} True if radio button has error
     */
    hasError: async () => {
      return (
        page.getByTestId(testId).element().getAttribute("aria-invalid") ===
        "true"
      );
    },

    /**
     * Get the error message if present
     * @returns {string|null} The error message or null
     */
    getErrorMessage: async () => {
      const element = page.getByTestId(testId).element();
      const errorId = element.getAttribute("aria-describedby");
      if (!errorId) return null;
      const errorElement = document.getElementById(errorId);
      return errorElement ? errorElement.textContent : null;
    },

    /**
     * Check if the radio button is disabled
     * @returns {boolean} True if radio button is disabled
     */
    isDisabled: async () => {
      return page.getByTestId(testId).element().disabled;
    },

    /**
     * Get the value of the radio button
     * @returns {string} The value attribute of the radio button
     */
    getValue: async () => {
      return page.getByTestId(testId).element().value;
    },

    /**
     * Get the raw input element
     * @returns {HTMLElement} The input element
     */
    getElement: async () => {
      return page.getByTestId(testId).element();
    },
  };
};

/**
 * Helper to interact with Spectrum Picker components
 * @param {string} testId - The data-test-id attribute value
 * @returns {Object} Helper methods for Picker interaction
 */
export const spectrumPicker = (testId) => {
  /**
   * Check if picker is in loading state
   * @returns {boolean} True if picker is loading
   */
  const isLoading = () => {
    // React Spectrum shows a progress circle when loading
    // Look for the progressbar role within or near the picker button
    const button = page.getByTestId(testId).element();

    // First check if progressbar is inside the button
    let progressCircle = button.querySelector('[role="progressbar"]');

    // If not found, check if it's a sibling (in case of different structure)
    if (!progressCircle && button.parentElement) {
      progressCircle = button.parentElement.querySelector(
        '[role="progressbar"]',
      );
    }

    return progressCircle !== null;
  };

  return {
    /**
     * Open the picker dropdown
     */
    open: async () => {
      const button = page.getByTestId(testId);
      await button.click();
    },

    /**
     * Select an option by its text
     * @param {string} optionText - The text of the option to select
     */
    selectOption: async (optionText) => {
      const button = page.getByTestId(testId);

      // Wait for the button to be visible (important when switching tabs)
      await expect.element(button).toBeVisible();

      await button.click();

      // Get the listbox that was opened by this picker
      const buttonElement = button.element();
      const listboxId = buttonElement.getAttribute("aria-controls");

      if (listboxId) {
        // Find option within the specific listbox
        const listbox = document.getElementById(listboxId);
        const option = Array.from(
          listbox.querySelectorAll('[role="option"]'),
        ).find((opt) => opt.textContent.trim() === optionText);
        if (option) {
          option.click();
          return;
        }
      }

      // Fallback to the original behavior if aria-controls is not present
      await page.getByRole("option", { name: optionText }).click();
    },

    /**
     * Get the currently selected value text
     * @returns {string|null} The selected option text or null if none selected
     */
    getSelectedText: async () => {
      const button = page.getByTestId(testId).element();
      const valueElement = button.querySelector("span");
      return valueElement ? valueElement.textContent.trim() : null;
    },

    /**
     * Check if the picker is open
     * @returns {boolean} True if picker dropdown is open
     */
    isOpen: async () => {
      const button = page.getByTestId(testId).element();
      return button.getAttribute("aria-expanded") === "true";
    },

    /**
     * Check if the picker is disabled
     * @returns {boolean} True if picker is disabled
     */
    isDisabled: async () => {
      const button = page.getByTestId(testId).element();
      return button.disabled || button.getAttribute("aria-disabled") === "true";
    },

    /**
     * Check if the picker has an error
     * @returns {boolean} True if picker has error
     */
    hasError: async () => {
      const button = page.getByTestId(testId).element();
      // Check if button has invalid class or parent has is-invalid class
      const hasInvalidClass = button.className.includes("--invalid");
      const parentHasInvalidClass =
        button.parentElement?.className.includes("is-invalid");
      return hasInvalidClass || parentHasInvalidClass || false;
    },

    /**
     * Get the error message if present
     * @returns {string|null} The error message or null
     */
    getErrorMessage: async () => {
      const button = page.getByTestId(testId).element();
      const errorId = button.getAttribute("aria-describedby");
      if (!errorId) return null;
      const errorElement = document.getElementById(errorId);
      return errorElement ? errorElement.textContent : null;
    },

    /**
     * Check if a specific option is available in the dropdown
     * @param {string} optionText - The text of the option to check
     * @returns {boolean} True if option exists
     */
    hasOption: async (optionText) => {
      await page.getByTestId(testId).click();
      const option = page.getByRole("option", { name: optionText });
      const exists = await option.query().then((el) => el !== null);
      // Close the picker
      await userEvent.keyboard("{Escape}");
      return exists;
    },

    /**
     * Get all available options in the picker
     * @returns {string[]} Array of option texts
     */
    getOptions: async () => {
      await page.getByTestId(testId).click();
      const options = await page.getByRole("option").all();
      const optionTexts = options.map((option) =>
        option.element().textContent.trim(),
      );
      // Close the picker
      await userEvent.keyboard("{Escape}");
      return optionTexts;
    },

    /**
     * Check if the picker is required
     * @returns {boolean} True if picker is required
     */
    isRequired: async () => {
      const button = page.getByTestId(testId).element();
      return button.getAttribute("aria-required") === "true";
    },

    /**
     * Get the placeholder text
     * @returns {string|null} The placeholder text or null
     */
    getPlaceholder: async () => {
      const button = page.getByTestId(testId).element();
      const placeholderElement = button.querySelector(
        '[data-placeholder="true"]',
      );
      return placeholderElement ? placeholderElement.textContent.trim() : null;
    },

    /**
     * Check if picker is in loading state
     * @returns {boolean} True if picker is loading
     */
    isLoading,

    /**
     * Wait for the picker to finish loading
     */
    waitForLoad: async () => {
      await expect.poll(() => !isLoading()).toBeTruthy();
    },

    /**
     * Get the raw button element
     * @returns {HTMLElement} The button element
     */
    getElement: async () => {
      return page.getByTestId(testId).element();
    },
  };
};

/**
 * Helper to interact with Spectrum Tab components
 * @param {string} testId - The data-test-id attribute value
 * @returns {Object} Helper methods for Tab interaction
 */
export const spectrumTab = (testId) => {
  return {
    /**
     * Click on the tab
     */
    click: async () => {
      await page.getByTestId(testId).click();
    },

    /**
     * Check if the tab is selected
     * @returns {boolean} True if tab is selected
     */
    isSelected: async () => {
      const element = page.getByTestId(testId).element();
      return element.getAttribute("aria-selected") === "true";
    },

    /**
     * Get the raw tab element
     * @returns {HTMLElement} The tab element
     */
    getElement: async () => {
      return page.getByTestId(testId).element();
    },
  };
};

/**
 * Helper to interact with Spectrum Button components
 * @param {string} testId - The data-test-id attribute value
 * @returns {Object} Helper methods for Button interaction
 */
export const spectrumButton = (testId) => {
  return {
    /**
     * Click the button
     */
    click: async () => {
      await page.getByTestId(testId).click();
    },

    /**
     * Check if the button is disabled
     * @returns {boolean} True if button is disabled
     */
    isDisabled: async () => {
      const button = page.getByTestId(testId);
      // Wait for the button to be visible (important when switching tabs)
      await expect.element(button).toBeVisible();
      const element = button.element();
      return (
        element.disabled || element.getAttribute("aria-disabled") === "true"
      );
    },

    /**
     * Check if the button is pressed (for toggle buttons)
     * @returns {boolean} True if button is pressed
     */
    isPressed: async () => {
      const element = page.getByTestId(testId).element();
      return element.getAttribute("aria-pressed") === "true";
    },

    /**
     * Get the button text content
     * @returns {string} The button text
     */
    getText: async () => {
      return page.getByTestId(testId).element().textContent.trim();
    },

    /**
     * Get the raw button element
     * @returns {HTMLElement} The button element
     */
    getElement: async () => {
      return page.getByTestId(testId).element();
    },
  };
};

/**
 * Helper to interact with tabs
 * @param {string|number} selector - Tab name (string) or tab index (number)
 * @returns {Object} Helper methods for tab interaction
 */
export const tabs = (selector) => {
  /**
   * Get the tab element
   * @returns {Promise<Element>} The tab element
   */
  const getTab = async () => {
    if (typeof selector === "number") {
      // Select by index
      const allTabs = page.getByRole("tab");
      return allTabs.nth(selector);
    }
    // Select by name
    return page.getByRole("tab", { name: selector });
  };

  return {
    /**
     * Click on the tab
     */
    click: async () => {
      const tab = await getTab();
      await tab.click();
    },

    /**
     * Get the nth occurrence of a tab with the same name
     * @param {number} index - The index of the tab (0-based)
     * @returns {Object} Tab helper for the specific occurrence
     */
    nth: (index) => {
      if (typeof selector !== "string") {
        throw new Error("nth() can only be used with string selectors");
      }
      const tabsByName = page.getByRole("tab", { name: selector });
      const specificTab = tabsByName.nth(index);

      return {
        click: async () => {
          await specificTab.click();
        },
        element: () => {
          return specificTab;
        },
      };
    },

    /**
     * Get the tab element for expect assertions
     * @returns {Promise<Element>}
     */
    element: async () => {
      const tab = await getTab();
      return tab;
    },
  };
};
