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
import Body from "../../../src/view/components/typography/body";
import renderView from "../helpers/renderView";

let view;

describe("Body", () => {
  afterEach(() => {
    view?.unmount();
  });

  it.each([
    ["XXXL", "25px"],
    ["XXL", "22px"],
    ["XL", "20px"],
    ["L", "18px"],
    ["M", "16px"],
    ["S", "14px"],
    ["XS", "12px"],
    ["XXS", "11px"],
  ])(
    "renders size %s as a paragraph with its native typography token",
    async (size, fontSize) => {
      view = await renderView(() => (
        <Body data-test-id="body" size={size}>
          Test Body
        </Body>
      ));

      const body = view.getByTestId("body");
      await expect.element(body).toHaveTextContent("Test Body");
      await expect.element(body).toHaveStyle({ "font-size": fontSize });
      expect(body.element().tagName).toBe("P");
    },
  );

  it("defaults to size S with the margins of a plain paragraph", async () => {
    view = await renderView(() => (
      <>
        <Body data-test-id="body">Test Body</Body>
        <p data-test-id="plain" style={{ fontSize: "14px" }}>
          Plain paragraph
        </p>
      </>
    ));

    const body = view.getByTestId("body");
    await expect.element(body).toHaveStyle({ "font-size": "14px" });
    const bodyStyle = getComputedStyle(body.element());
    const plainStyle = getComputedStyle(view.getByTestId("plain").element());
    expect(bodyStyle.marginTop).toBe(plainStyle.marginTop);
    expect(bodyStyle.marginBottom).toBe(plainStyle.marginBottom);
  });

  it("preserves an explicit top margin of size-300", async () => {
    view = await renderView(() => (
      <Body data-test-id="body" marginTop="size-300">
        Test Body
      </Body>
    ));

    await expect
      .element(view.getByTestId("body"))
      .toHaveStyle({ "margin-top": "24px" });
  });

  it("preserves an explicit bottom margin of size-300", async () => {
    view = await renderView(() => (
      <Body data-test-id="body" marginBottom="size-300">
        Test Body
      </Body>
    ));

    await expect
      .element(view.getByTestId("body"))
      .toHaveStyle({ "margin-bottom": "24px" });
  });
});
