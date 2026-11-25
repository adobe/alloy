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
import { userEvent } from "vitest/browser";
import field from "../field";
import { TIMEOUT } from "./timeout";

export default (view) => {
  const infoButton = () => view.getByTestId("nodeDescription");
  const popover = () => view.getByRole("dialog");
  const autoPopulationAlert = () => view.getByTestId("autoPopulationAlert");
  const clearButton = () => field(view.getByTestId("clearButton"));

  return {
    breadcrumb: {
      clickItem: (label) =>
        field(
          view
            .getByTestId("breadcrumb")
            .getByRole("link", { name: label, exact: true }),
        ).click(),
    },
    editor: {
      expectExists: () =>
        expect.element(view.getByTestId("editor"), TIMEOUT).toBeInTheDocument(),
    },
    autoPopulationAlert: {
      expectVisible: () =>
        expect.element(autoPopulationAlert(), TIMEOUT).toBeVisible(),
      expectNotExists: () =>
        expect.element(autoPopulationAlert(), TIMEOUT).not.toBeInTheDocument(),
      expectText: (text) =>
        expect.element(autoPopulationAlert(), TIMEOUT).toHaveTextContent(text),
    },
    description: {
      expectInfoIcon: () => expect.element(infoButton(), TIMEOUT).toBeVisible(),
      expectNoInfoIcon: () =>
        expect.element(infoButton(), TIMEOUT).not.toBeInTheDocument(),
      open: () => field(infoButton()).click(),
      close: () => userEvent.keyboard("{Escape}"),
      expectPopoverText: (text) =>
        expect.element(popover(), TIMEOUT).toHaveTextContent(text),
      expectPopoverClosed: () =>
        expect.element(popover(), TIMEOUT).not.toBeInTheDocument(),
    },
    clearButton: {
      click: () => clearButton().click(),
      expectVisible: () => clearButton().expectVisible(),
      expectEnabled: () => clearButton().expectEnabled(),
      expectDisabled: () => clearButton().expectDisabled(),
    },
  };
};
