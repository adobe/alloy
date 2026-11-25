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

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import field from "./field";
import { searchAndSelectMenuOption } from "./dataElements/schemaPickers";

describe("field helpers", () => {
  let container;
  let timer;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
  });

  afterEach(() => {
    clearTimeout(timer);
    container.remove();
  });

  it("reads values from direct and wrapped textareas", async () => {
    container.innerHTML = `
      <textarea data-test-id="direct">direct value</textarea>
      <div data-test-id="wrapped"><textarea>wrapped value</textarea></div>
    `;

    await field(page.getByTestId("direct")).expectValue("direct value");
    await field(page.getByTestId("wrapped")).expectValue(/^wrapped value$/);
  });

  it.each([
    ["check", false, true],
    ["uncheck", true, false],
  ])(
    "waits for a checkbox before %sing it",
    async (action, initial, result) => {
      timer = setTimeout(() => {
        const label = document.createElement("label");
        label.dataset.testId = "delayed";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = initial;
        label.append(checkbox);
        container.append(label);
      }, 100);

      await field(page.getByTestId("delayed"))[action]();
      await expect
        .element(page.getByTestId("delayed").locator("input"))
        .toHaveProperty("checked", result);
    },
  );

  it("searches the field's own listbox and selects a label different from the search", async () => {
    container.innerHTML = `
      <div role="listbox" id="other"><div role="option">eVar10</div></div>
      <div data-test-id="combo"><input role="combobox" aria-expanded="false" aria-controls="own"></div>
      <div role="listbox" id="own" hidden><div role="option">eVar10</div></div>
    `;
    const input = container.querySelector("input");
    const ownList = container.querySelector("#own");
    let otherClicked = false;
    container
      .querySelector("#other [role=option]")
      .addEventListener("click", () => {
        otherClicked = true;
      });
    input.addEventListener("input", () => {
      input.setAttribute("aria-expanded", "true");
      ownList.hidden = false;
    });
    ownList.querySelector("[role=option]").addEventListener("click", () => {
      input.value = "eVar10";
      input.setAttribute("aria-expanded", "false");
      ownList.hidden = true;
    });

    await searchAndSelectMenuOption(
      page.getByTestId("combo"),
      "eVar",
      "eVar10",
    );
    await expect
      .element(page.getByTestId("combo").locator("input"))
      .toHaveValue("eVar10");
    expect(otherClicked).toBe(false);
  });
});
