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
import { userEvent } from "vitest/browser";
import { http, HttpResponse } from "msw";
import useView from "../helpers/useView";
import { worker } from "../helpers/mocks/browser";
import { singleSchemaHandlers } from "../helpers/mocks/defaultHandlers";
import XdmObjectView from "../../../src/view/dataElements/xdmObjectView";
import Body from "../../../src/view/components/typography/body";

let result;
const settings = {
  sandbox: { name: "prod" },
  schema: {
    id: "https://ns.adobe.com/test/schemas/sch123",
    version: "1.0",
  },
  data: { profile: { name: "Ada" } },
};

const setup = async () => {
  worker.use(
    ...singleSchemaHandlers,
    http.get(/\/data\/foundation\/schemaregistry\/tenant\/schemas\/.+/, () =>
      HttpResponse.json({
        $id: settings.schema.id,
        title: "Test Schema 1",
        version: "1.0",
        type: "object",
        properties: {
          profile: {
            title: "Profile",
            type: "object",
            properties: { name: { title: "Name", type: "string" } },
          },
        },
      }),
    ),
  );
  result = await useView(() => (
    <>
      <XdmObjectView />
      <Body>Native body reference</Body>
    </>
  ));
  await result.driver.init({ settings });
  await result.view.getByText("profile", { exact: true }).click();
};

describe("Object editor guidance typography", () => {
  afterEach(() => result?.cleanup());

  it("uses native body typography beneath the horizontal population radios", async () => {
    await setup();
    const guidance = result.view.getByText(
      /^To provide values for individual attributes,/,
    );
    await expect.element(guidance).toBeVisible();
    await document.fonts.ready;
    const actual = getComputedStyle(guidance.element());
    const reference = getComputedStyle(
      result.view.getByText("Native body reference").element(),
    );
    for (const property of [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "lineHeight",
    ]) {
      expect(actual[property]).toBe(reference[property]);
    }
    await expect
      .element(result.view.getByRole("radiogroup", { name: "Profile" }))
      .toHaveAttribute("aria-orientation", "horizontal");
    await result.driver.expectSettings().toEqual(settings);
    await result.driver.expectValidate().toBe(true);
  });

  it("preserves strategy selection, editing, validation and serialized settings", async () => {
    await setup();
    const { view, driver } = result;
    await view.getByText("Provide entire object", { exact: true }).click();
    const value = view.getByTestId("valueField").getByRole("textbox");
    await value.fill("not a data element");
    await driver.expectValidate().toBe(false);
    await expect
      .element(view.getByText("Value must be a data element."))
      .toBeVisible();
    await value.fill("%profile%");
    await driver.expectValidate().toBe(true);
    await driver.expectSettings().toEqual({
      ...settings,
      data: { profile: "%profile%" },
    });
    view
      .getByRole("radio", { name: "Provide entire object" })
      .element()
      .focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect
      .element(
        view.getByRole("radio", { name: "Provide individual attributes" }),
      )
      .toBeChecked();
    await driver.expectSettings().toEqual(settings);
    await view.getByRole("img", { name: "plus-square" }).click();
    await view.getByText("name", { exact: true }).click();
    await view.getByTestId("valueField").getByRole("textbox").fill("Grace");
    await driver.expectSettings().toEqual({
      ...settings,
      data: { profile: { name: "Grace" } },
    });
    await driver.expectValidate().toBe(true);
    await view.getByRole("link", { name: "profile", exact: true }).click();
    await expect
      .element(view.getByText(/^To provide values for individual attributes,/))
      .toBeVisible();
  });
});
