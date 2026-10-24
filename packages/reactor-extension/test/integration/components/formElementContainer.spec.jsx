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
import { TextField } from "@react-spectrum/s2";
import FormElementContainer from "../../../src/view/components/formElementContainer";
import renderView from "../helpers/renderView";

let view;

describe("Form element spacing", () => {
  afterEach(() => {
    view?.unmount();
  });

  it.each([
    ["column", 24],
    ["row", 8],
  ])("separates %s field groups by %i px", async (direction, gap) => {
    view = await renderView(() => (
      <FormElementContainer data-test-id="fields" direction={direction}>
        <TextField label="First field" description="First field description" />
        <TextField
          label="Second field"
          description="Second field description"
        />
      </FormElementContainer>
    ));

    const [first, second] = Array.from(
      view.getByTestId("fields").element().children,
      (element) => element.getBoundingClientRect(),
    );
    const actualGap =
      direction === "column"
        ? second.top - first.bottom
        : second.left - first.right;

    expect(actualGap).toBeCloseTo(gap, 1);
  });
});
