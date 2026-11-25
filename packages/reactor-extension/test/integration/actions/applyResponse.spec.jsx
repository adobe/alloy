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

import { afterEach, beforeEach, describe, it } from "vitest";
import useView from "../helpers/useView";
import field from "../helpers/field";
import ApplyResponseView from "../../../src/view/actions/applyResponseView";
import runInstanceNameOptionsTest from "../helpers/actions/instanceNameOptionsTest";
import { instances } from "../helpers/actions/fixtures";

const extensionSettings = { instances: [{ name: "alloy" }] };

describe("Apply response action validation", () => {
  let view;
  let driver;
  let cleanup;

  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ApplyResponseView));
  });

  afterEach(() => cleanup());

  it("accepts data elements for the response", async () => {
    await driver.init({
      extensionSettings,
      settings: {
        instanceName: "alloy",
        responseHeaders: "%headers%",
        responseBody: "%body%",
      },
    });

    await driver.expectValidate().toBe(true);
  });

  it("requires a response body", async () => {
    await driver.init({
      extensionSettings,
      settings: { instanceName: "alloy" },
    });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("responseBodyField")).expectError(
      /please provide a response body/i,
    );
  });

  it("requires the response headers to be a data element", async () => {
    await driver.init({
      extensionSettings,
      settings: {
        instanceName: "alloy",
        responseHeaders: "headers",
        responseBody: "%body%",
      },
    });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("responseHeadersField")).expectError(
      /data element/i,
    );
  });
});

describe("Apply response action form", () => {
  const extensionSettings = { instances };
  let view;
  let driver;
  let cleanup;
  let instanceNameField;
  let responseHeadersField;
  let responseBodyField;
  let renderDecisionsField;

  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ApplyResponseView));
    instanceNameField = field(view.getByTestId("instanceNameField"));
    responseHeadersField = field(view.getByTestId("responseHeadersField"));
    responseBodyField = field(view.getByTestId("responseBodyField"));
    renderDecisionsField = field(view.getByTestId("renderDecisionsField"));
  });

  afterEach(() => cleanup());

  it("initializes form fields with full settings", async () => {
    await driver.init({
      extensionSettings,
      settings: {
        instanceName: "alloy2",
        responseHeaders: "%headers%",
        responseBody: "%body%",
        renderDecisions: true,
      },
    });

    await instanceNameField.expectValue("alloy2");
    await responseHeadersField.expectValue("%headers%");
    await responseBodyField.expectValue("%body%");
    await renderDecisionsField.expectChecked();
  });

  it("initializes form fields with minimal settings", async () => {
    await driver.init({
      extensionSettings,
      settings: { instanceName: "alloy1", responseBody: "%mybody%" },
    });

    await instanceNameField.expectValue("alloy1");
    await responseHeadersField.expectValue("");
    await responseBodyField.expectValue("%mybody%");
    await renderDecisionsField.expectUnchecked();
  });

  it("initializes form fields with no settings", async () => {
    await driver.init({ extensionSettings, settings: null });

    await instanceNameField.expectValue("alloy1");
    await responseHeadersField.expectValue("");
    await responseBodyField.expectValue("");
    await renderDecisionsField.expectUnchecked();
  });

  it("returns minimal valid settings", async () => {
    await driver.init({
      extensionSettings,
      settings: { responseBody: "%mybody%" },
    });

    await driver.expectValidate().toBe(true);
    await driver
      .expectSettings()
      .toEqual({ instanceName: "alloy1", responseBody: "%mybody%" });
  });

  it("returns full valid settings", async () => {
    await driver.init({ extensionSettings, settings: null });

    await instanceNameField.selectOption("alloy2");
    await responseHeadersField.fill("%myheaders%");
    await responseBodyField.fill("%mybody%");
    await renderDecisionsField.click();

    await driver.expectValidate().toBe(true);
    await driver.expectSettings().toEqual({
      instanceName: "alloy2",
      responseHeaders: "%myheaders%",
      responseBody: "%mybody%",
      renderDecisions: true,
    });
  });

  it("shows error for responseBody value that is not a data element", async () => {
    await driver.init({ extensionSettings, settings: null });

    await responseBodyField.fill("%body");

    await driver.expectValidate().toBe(false);
    await responseBodyField.expectError(/please specify a data element/i);
  });

  it.each([
    ["responseHeaders", "responseHeadersField"],
    ["responseBody", "responseBodyField"],
  ])(
    "shows error for %s value that is more than one data element",
    async (_, testId) => {
      await driver.init({
        extensionSettings,
        settings: { responseBody: "%body%" },
      });

      await field(view.getByTestId(testId)).fill("%a%%b%");

      await driver.expectValidate().toBe(false);
      await field(view.getByTestId(testId)).expectError(
        /please specify a data element/i,
      );
    },
  );
});

runInstanceNameOptionsTest({
  openView: () => useView(ApplyResponseView),
  pickerTestId: "instanceNameField",
});
