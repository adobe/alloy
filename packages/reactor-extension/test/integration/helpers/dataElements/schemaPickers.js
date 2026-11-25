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

import { expect } from "vitest";

const TIMEOUT = { timeout: 6000 };

const trigger = (locator) => locator.locator("input, button").first();

const listbox = (locator) => trigger(locator).controls();

export const openMenu = async (locator) => {
  const control = trigger(locator);
  if (control.element().getAttribute("aria-expanded") !== "true") {
    const isComboBox = control.element().tagName.toLowerCase() === "input";
    await (isComboBox ? locator.getByRole("button") : control).click(TIMEOUT);
  }
  await expect
    .element(control, TIMEOUT)
    .toHaveAttribute("aria-expanded", "true");
};

export const enterSearch = async (locator, text) => {
  await trigger(locator).fill(text, TIMEOUT);
  await expect
    .element(trigger(locator), TIMEOUT)
    .toHaveAttribute("aria-expanded", "true");
};

export const menuOptionLabels = (locator) =>
  [...listbox(locator).element().querySelectorAll('[role="option"]')].map(
    (option) => option.textContent.trim(),
  );

export const selectMenuOption = async (locator, label) => {
  await listbox(locator)
    .getByRole("option", { name: label, exact: true })
    .click(TIMEOUT);
};
