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
import useView from "../helpers/useView";
import { worker } from "../helpers/mocks/browser";
import {
  singleSchemaHandlers,
  schemaDetailsHandlers,
} from "../helpers/mocks/defaultHandlers";
import VariableView from "../../../src/view/dataElements/variableView";
import Body from "../../../src/view/components/typography/body";

let cleanup;

describe("Variable data element typography", () => {
  afterEach(() => cleanup?.());

  it("uses native S2 body typography for the introduction and schema guidance", async () => {
    worker.use(...singleSchemaHandlers, ...schemaDetailsHandlers);
    const result = await useView(() => (
      <>
        <VariableView />
        <Body>Native body reference</Body>
      </>
    ));
    cleanup = result.cleanup;
    const settings = {
      sandbox: { name: "prod" },
      schema: {
        id: "https://ns.adobe.com/test/schemas/sch123",
        version: "1.0",
      },
    };
    await result.driver.init({ settings });
    const description = result.view.getByText(
      /^Variable data elements are used to build up/,
    );
    await expect.element(description).toBeVisible();
    await document.fonts.ready;
    const guidance = result.view.getByText(
      /first, or choose an existing one below\./,
    );
    await expect.element(guidance).toBeVisible();
    const reference = getComputedStyle(
      result.view.getByText("Native body reference").element(),
    );
    for (const block of [description, guidance]) {
      const actual = getComputedStyle(block.element());
      for (const property of [
        "fontFamily",
        "fontSize",
        "fontWeight",
        "lineHeight",
      ]) {
        expect(actual[property]).toBe(reference[property]);
      }
    }
    expect(description.element().getBoundingClientRect().width).toBe(400);
    await expect
      .element(
        result.view.getByRole("link", {
          name: "Learn more about the Variable data element type",
        }),
      )
      .toHaveAttribute("target", "_blank");
    for (const [name, workflow] of [
      ["Create a schema", "schema-create"],
      ["with ML assistance", "ml-schema-create"],
    ]) {
      const link = result.view
        .getByRole("link", { name, exact: true })
        .element();
      expect(link.getAttribute("href")).toBe(
        `https://experience.adobe.com/#/data-collection/platform/workflow/${workflow}`,
      );
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    }
    await result.driver.expectSettings().toEqual(settings);
    await result.driver.expectValidate().toBe(true);
  });
});
