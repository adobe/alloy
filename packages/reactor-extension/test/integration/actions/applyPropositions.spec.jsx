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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useView from "../helpers/useView";
import loadEntryView from "../helpers/entryView";
import field from "../helpers/field";
import { runRequiredComponentTests } from "../helpers/actions/requiredComponentTests";
import runInstanceNameOptionsTest from "../helpers/actions/instanceNameOptionsTest";
import { instances } from "../helpers/actions/fixtures";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));
const View = await loadEntryView(
  () => import("../../../src/view/actions/applyPropositions"),
);

const extensionSettings = { instances };

describe("Apply propositions action", () => {
  let view;
  let driver;
  let cleanup;
  let instanceNameField;
  let propositionsField;
  let viewNameField;
  let metadataFormOption;
  let metadataDataElementOption;
  let metadataDataElementField;
  let metadataAddButton;
  const metadata = (index) => ({
    scopeField: field(view.getByTestId(`metadata.${index}.scopeTextField`)),
    selectorField: field(
      view.getByTestId(`metadata.${index}.selectorTextField`),
    ),
    actionType: field(view.getByTestId(`metadata.${index}.actionTypeField`)),
    removeButton: field(view.getByTestId(`metadata${index}RemoveButton`)),
  });

  const fillMetadataRow = async (index, { scope, selector, action }) => {
    const row = metadata(index);
    await row.scopeField.fill(scope);
    await row.selectorField.fill(selector);
    await row.actionType.selectOption(action);
  };

  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(View));
    instanceNameField = field(view.getByTestId("instanceNamePicker"));
    propositionsField = field(view.getByTestId("propositionsTextField"));
    viewNameField = field(view.getByTestId("viewNameTextField"));
    metadataFormOption = field(view.getByTestId("metadataFormOption"));
    metadataDataElementOption = field(
      view.getByTestId("metadataDataElementOption"),
    );
    metadataDataElementField = field(
      view.getByTestId("metadataDataElementField"),
    );
    metadataAddButton = field(view.getByTestId("metadataAddButton"));
  });

  afterEach(() => cleanup());

  it("initializes form fields with full settings", async () => {
    await driver.init({
      extensionSettings,
      settings: {
        instanceName: "alloy2",
        propositions: "%propositions%",
        viewName: "%viewName%",
        metadata: {
          scope1: { selector: ".selector1", actionType: "setHtml" },
          scope2: { selector: ".selector2", actionType: "appendHtml" },
        },
      },
    });

    await instanceNameField.expectValue("alloy2");
    await propositionsField.expectValue("%propositions%");
    await viewNameField.expectValue("%viewName%");
    await metadata(0).scopeField.expectValue("scope1");
    await metadata(0).selectorField.expectValue(".selector1");
    await metadata(0).actionType.expectValue("Set HTML");
    await metadata(1).scopeField.expectValue("scope2");
    await metadata(1).selectorField.expectValue(".selector2");
    await metadata(1).actionType.expectValue("Append HTML");
  });

  it("initializes form fields with minimal settings", async () => {
    await driver.init({
      extensionSettings,
      settings: { instanceName: "alloy1", propositions: "%mypropositions%" },
    });

    await instanceNameField.expectValue("alloy1");
    await propositionsField.expectValue("%mypropositions%");
    await viewNameField.expectValue("");
    await metadata(0).scopeField.expectValue("");
    await metadata(0).selectorField.expectValue("");
    await metadata(0).actionType.expectValue("");
  });

  it("explains how to apply proposition metadata", async () => {
    await driver.init({ extensionSettings, settings: null });
    await metadata(0).actionType.selectOption("Set HTML");

    for (const text of [
      "Enter the scope (i.e. mbox or AJO surface name) for the propositions that you would like to apply these settings",
      "Enter the CSS selector where this proposition should be rendered",
      "Select how this proposition should be applied",
    ]) {
      // eslint-disable-next-line no-await-in-loop
      await expect.element(view.getByText(text)).toBeVisible();
    }
  });

  it("initializes form fields with no settings", async () => {
    await driver.init({ extensionSettings, settings: null });

    await instanceNameField.expectValue("alloy1");
    await propositionsField.expectValue("");
    await viewNameField.expectValue("");
    await metadataFormOption.expectChecked();
    await metadata(0).scopeField.expectValue("");
    await metadata(0).selectorField.expectValue("");
    await metadata(0).actionType.expectValue("");
  });

  it("returns minimal valid settings", async () => {
    await driver.init({
      extensionSettings,
      settings: { propositions: "%myprops%" },
    });

    await driver.expectValidate().toBe(true);
    await driver
      .expectSettings()
      .toEqual({ instanceName: "alloy1", propositions: "%myprops%" });
  });

  it("returns full valid settings", async () => {
    await driver.init({ extensionSettings, settings: null });

    await instanceNameField.selectOption("alloy2");
    await propositionsField.fill("%myprops%");
    await viewNameField.fill("myview");
    await fillMetadataRow(0, {
      scope: "scope1",
      selector: ".selector1",
      action: "Set HTML",
    });
    await metadataAddButton.click();
    await fillMetadataRow(1, {
      scope: "scope2",
      selector: ".selector2",
      action: "Replace HTML",
    });

    await driver.expectValidate().toBe(true);
    await driver.expectSettings().toEqual({
      instanceName: "alloy2",
      propositions: "%myprops%",
      viewName: "myview",
      metadata: {
        scope1: { selector: ".selector1", actionType: "setHtml" },
        scope2: { selector: ".selector2", actionType: "replaceHtml" },
      },
    });
  });

  it("removes a scope", async () => {
    await driver.init({ extensionSettings, settings: null });

    await fillMetadataRow(0, {
      scope: "scope1",
      selector: ".selector1",
      action: "Set HTML",
    });
    await metadata(0).removeButton.expectEnabled();
    await metadataAddButton.click();
    await fillMetadataRow(1, {
      scope: "scope2",
      selector: ".selector2",
      action: "Replace HTML",
    });
    await metadata(0).removeButton.click();

    await metadata(0).scopeField.expectValue("scope2");
    await driver.expectValidate().toBe(true);
    await driver.expectSettings().toEqual({
      instanceName: "alloy1",
      metadata: {
        scope2: { selector: ".selector2", actionType: "replaceHtml" },
      },
    });
  });

  it("shows error for propositions value that is not a data element", async () => {
    await driver.init({ extensionSettings, settings: null });

    await propositionsField.fill("propositions");

    await driver.expectValidate().toBe(false);
    await propositionsField.expectError(/please specify a data element/i);
  });

  it("doesn't show error for viewName value that is not a data element", async () => {
    await driver.init({
      extensionSettings,
      settings: { propositions: "%myprops%" },
    });

    await viewNameField.fill("%dataelement");

    await driver.expectValidate().toBe(true);
    await viewNameField.expectNotInvalid();
  });

  it("shows error for propositions value that is more than one data element", async () => {
    await driver.init({ extensionSettings, settings: null });

    await propositionsField.fill("%a%%b%");

    await driver.expectValidate().toBe(false);
    await propositionsField.expectError(/please specify a data element/i);
  });

  it("initializes metadata as a data element", async () => {
    await driver.init({
      extensionSettings,
      settings: { instanceName: "alloy1", metadata: "%metadata1%" },
    });

    await metadataDataElementOption.expectChecked();
    await metadataFormOption.expectUnchecked();
    await metadataDataElementField.expectValue("%metadata1%");
    await metadata(0).scopeField.expectHidden();
  });

  it("returns metadata as a data element", async () => {
    await driver.init({ extensionSettings, settings: null });

    await metadataDataElementOption.click();
    await metadataDataElementField.fill("%metadata1%");

    await driver.expectValidate().toBe(true);
    await driver
      .expectSettings()
      .toEqual({ instanceName: "alloy1", metadata: "%metadata1%" });
  });
});

runRequiredComponentTests({
  openView: () => useView(View),
  requiredComponent: "personalization",
  minimumValidSettings: { propositions: "%myprops%" },
  formTestId: "instanceNamePicker",
});

runInstanceNameOptionsTest({
  openView: () => useView(View),
  pickerTestId: "instanceNamePicker",
});
