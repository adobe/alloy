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

import { afterEach, describe, expect, it } from "vitest";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };
import InfoMessage from "../../../src/view/components/infoMessage";
import renderView from "../helpers/renderView";

let view;

describe("InfoMessage", () => {
  afterEach(() => {
    view?.unmount();
  });

  it("renders plain guidance with a subsection heading and rich content", async () => {
    view = await renderView(() => (
      <InfoMessage title="Helpful guidance" data-test-id="guidance">
        Read the <a href="https://example.com">documentation</a>.
      </InfoMessage>
    ));

    await expect
      .element(
        view.getByRole("heading", { name: "Helpful guidance", level: 5 }),
      )
      .toBeVisible();
    await expect
      .element(view.getByRole("link", { name: "documentation" }))
      .toHaveAttribute("href", "https://example.com");
    await expect.element(view.getByTestId("guidance")).toHaveStyle({
      "border-top-width": "0px",
      "margin-top": "0px",
      "margin-bottom": "0px",
      gap: "8px",
    });
  });

  it("supports a page heading and caller-owned layout spacing", async () => {
    view = await renderView(() => (
      <InfoMessage
        title="Page guidance"
        headingLevel={3}
        data-test-id="guidance"
        styles={style({ width: 480, marginBottom: 24 })}
      >
        Description
      </InfoMessage>
    ));

    await expect
      .element(view.getByRole("heading", { name: "Page guidance", level: 3 }))
      .toBeVisible();
    await expect.element(view.getByTestId("guidance")).toHaveStyle({
      width: "480px",
      "margin-bottom": "24px",
    });
  });
});
