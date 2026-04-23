/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, beforeEach, afterEach } from "vitest";

import useView from "../helpers/useView";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import { buildSettings } from "../helpers/settingsUtils";
import field from "../helpers/field";

let view;
let driver;
let cleanup;
let edgeBasePathField;
let edgeBasePathRestoreButton;

describe("Config advanced section", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
    edgeBasePathField = field(view.getByTestId("edgeBasePathField"));
    edgeBasePathRestoreButton = field(
      view.getByTestId("edgeBasePathRestoreButton"),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("sets form values from settings", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeBasePath: "custom-path",
          },
        ],
      }),
    );

    await edgeBasePathField.expectValue("custom-path");
  });

  it("updates form values and saves to settings", async () => {
    await driver.init(buildSettings());

    await edgeBasePathField.fill("my-custom-path");

    await driver
      .expectSettings((s) => s.instances[0].edgeBasePath)
      .toBe("my-custom-path");
  });

  it("shows default value 'ee' when no setting is provided", async () => {
    await driver.init(buildSettings());

    await edgeBasePathField.expectValue("ee");
  });

  it("does not save default value 'ee' to settings", async () => {
    await driver.init(buildSettings());

    await driver
      .expectSettings((s) => s.instances[0].edgeBasePath)
      .toBeUndefined();
  });

  it("allows data element in edge base path field", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeBasePath: "%myDataElement%",
          },
        ],
      }),
    );

    await edgeBasePathField.expectValue("%myDataElement%");

    await driver
      .expectSettings((s) => s.instances[0].edgeBasePath)
      .toBe("%myDataElement%");
  });

  it("restores default edge base path when restore button is clicked", async () => {
    await driver.init(buildSettings());

    await edgeBasePathField.fill("custom-path");

    await edgeBasePathField.expectValue("custom-path");

    await edgeBasePathRestoreButton.click();

    await edgeBasePathField.expectValue("ee");
  });

  describe("validation", () => {
    it("requires edge base path", async () => {
      await driver.init(buildSettings());

      await driver.expectValidate().toBe(true);

      await edgeBasePathField.clear();

      await edgeBasePathField.expectError(/please specify an edge base path/i);

      await driver.expectValidate().toBe(false);
    });

    it("accepts valid edge base path", async () => {
      await driver.init(
        buildSettings({
          instances: [
            {
              name: "alloy",
              edgeBasePath: "custom-edge-path",
            },
          ],
        }),
      );

      await driver.expectValidate().toBe(true);
    });
  });
});
