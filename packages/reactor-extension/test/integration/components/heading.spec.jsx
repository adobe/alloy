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
import Heading from "../../../src/view/components/typography/heading";
import renderView from "../helpers/renderView";

let view;

describe("Heading spacing", () => {
  afterEach(() => {
    view?.unmount();
  });

  it.each([
    ["XXXL", "H1", 1, "58px", "800"],
    ["XXL", "H1", 1, "45px", "800"],
    ["XL", "H1", 1, "36px", "800"],
    ["L", "H2", 2, "28px", "800"],
    ["M", "H3", 3, "22px", "800"],
    ["S", "H4", 4, "18px", "800"],
    ["XS", "H5", 5, "14px", "700"],
    ["XXS", "H6", 6, "14px", "800"],
  ])(
    "renders size %s as an %s heading with its native typography tokens",
    async (size, tagName, level, fontSize, fontWeight) => {
      view = await renderView(() => (
        <Heading size={size}>Test Heading</Heading>
      ));

      const heading = view.getByRole("heading", { level });
      await expect.element(heading).toHaveTextContent("Test Heading");
      expect(heading.element().tagName).toBe(tagName);
      await expect
        .element(heading)
        .toHaveStyle({ "font-size": fontSize, "font-weight": fontWeight });
    },
  );

  it("defaults to a size S h4 heading", async () => {
    view = await renderView(() => <Heading>Test Heading</Heading>);

    await expect
      .element(view.getByRole("heading", { level: 4 }))
      .toHaveStyle({ "font-size": "18px", "font-weight": "800" });
  });

  it("preserves an explicit bottom margin of size-300", async () => {
    view = await renderView(() => (
      <Heading marginBottom="size-300">Test Heading</Heading>
    ));

    await expect
      .element(view.getByRole("heading", { level: 4 }))
      .toHaveStyle({ "margin-bottom": "24px" });
  });

  it("leaves h5 top spacing to the surrounding layout", async () => {
    view = await renderView(() => (
      <Heading size="XS" marginBottom="size-10">
        Adobe Analytics
      </Heading>
    ));

    await expect
      .element(view.getByRole("heading", { level: 5 }))
      .toHaveStyle({ "margin-top": "0px", "margin-bottom": "1px" });
  });

  it("can set a semantic level without changing its typography", async () => {
    view = await renderView(() => (
      <Heading size="XS" level={3}>
        Page guidance
      </Heading>
    ));

    await expect
      .element(view.getByRole("heading", { level: 3 }))
      .toHaveStyle({ "font-size": "14px", "font-weight": "700" });
  });

  it.each([
    [0, "0px"],
    ["size-300", "24px"],
  ])("preserves an explicit top margin of %s", async (marginTop, expected) => {
    view = await renderView(() => (
      <Heading size="XS" marginTop={marginTop}>
        Adobe Analytics
      </Heading>
    ));

    await expect
      .element(view.getByRole("heading", { level: 5 }))
      .toHaveStyle({ "margin-top": expected });
  });
});
