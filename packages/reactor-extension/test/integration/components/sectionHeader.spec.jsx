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
import SectionHeader from "../../../src/view/components/sectionHeader";
import renderView from "../helpers/renderView";

let view;

describe("Section header layout", () => {
  afterEach(() => {
    view?.unmount();
  });

  it("places the divider between sections, before the next heading", async () => {
    view = await renderView(() => (
      <>
        <p>Previous section content</p>
        <SectionHeader learnMoreUrl="https://example.com">
          Identity
        </SectionHeader>
      </>
    ));

    const previous = view.getByText("Previous section content").element();
    const divider = view.getByRole("separator").element();
    const heading = view.getByRole("heading", { name: "Identity" }).element();

    expect(divider.getBoundingClientRect().top).toBeGreaterThan(
      previous.getBoundingClientRect().bottom,
    );
    expect(
      heading.getBoundingClientRect().top -
        divider.getBoundingClientRect().bottom,
    ).toBeCloseTo(8, 1);
    await expect
      .element(view.getByRole("link", { name: "Learn more" }))
      .toBeVisible();
  });

  it("omits a leading divider for a first section with no top margin", async () => {
    view = await renderView(() => (
      <SectionHeader marginTop={0}>Components</SectionHeader>
    ));

    await expect.element(view.getByRole("separator")).not.toBeInTheDocument();
    await expect
      .element(view.getByRole("heading", { name: "Components" }))
      .toHaveStyle({ "margin-top": "0px" });
  });
});
