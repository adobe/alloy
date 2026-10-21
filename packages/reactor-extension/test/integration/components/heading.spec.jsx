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
