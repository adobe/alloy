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

import { describe, it, beforeEach, afterEach, expect } from "vitest";

import useView from "../helpers/useView";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import configurationUI from "../helpers/ui/configurationUI";
import { buildSettings } from "../helpers/settingsUtils";
import field from "../helpers/field";

let view;
let ui;
let driver;
let cleanup;
let regionField;
let stickyConversationSessionField;
let streamTimeoutField;
let brandConciergeComponentCheckbox;
let collectSourcesField;

describe("Config brand concierge section", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
    ui = configurationUI(view);
    regionField = field(view.getByTestId("regionField"));
    stickyConversationSessionField = field(
      view.getByTestId("stickyConversationSessionField"),
    );
    streamTimeoutField = field(view.getByTestId("streamTimeoutDataTestId"));
    collectSourcesField = field(view.getByTestId("collectSourcesDataTestId"));
    brandConciergeComponentCheckbox = field(
      view.getByTestId("brandConciergeComponentCheckbox"),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("sets form values from settings", async () => {
    await driver.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
        instances: [
          {
            name: "alloy",
            conversation: {
              region: "va7",
              stickyConversationSession: true,
              streamTimeout: 20000, // 20 seconds in milliseconds
              collectSources: true,
            },
          },
        ],
      }),
    );

    await regionField.expectValue("va7");
    await stickyConversationSessionField.expectChecked();
    await streamTimeoutField.expectValue("20");
    await collectSourcesField.expectChecked();
  });

  it("saves region to settings", async () => {
    await driver.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
      }),
    );

    await regionField.fill("or2");

    await driver
      .expectSettings((s) => s.instances[0].conversation.region)
      .toBe("or2");
  });

  it("does not save region when it equals default value", async () => {
    await driver.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
      }),
    );

    await driver
      .expectSettings((s) => s.instances[0].conversation?.region)
      .toBeUndefined();
  });

  it("shows validation error for invalid region format", async () => {
    await driver.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
      }),
    );

    await regionField.fill("invalid-region");

    await driver.expectValidate().toBe(false);

    await regionField.expectError(/valid region/i);
  });

  it("passes validation when region is cleared after being set", async () => {
    await driver.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
        instances: [
          {
            name: "alloy",
            conversation: {
              region: "va7",
            },
          },
        ],
      }),
    );

    await regionField.expectValue("va7");
    await regionField.clear();

    await driver.expectValidate().toBe(true);

    await driver
      .expectSettings((s) => s.instances[0].conversation?.region)
      .toBeUndefined();
  });

  it("accepts valid region formats", async () => {
    await driver.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
      }),
    );

    for (const region of ["va7", "or2", "irl1"]) {
      // eslint-disable-next-line no-await-in-loop
      await regionField.fill(region);
      // eslint-disable-next-line no-await-in-loop
      await driver.expectValidate().toBe(true);
    }
  });

  it("updates form values and saves to settings", async () => {
    await driver.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
      }),
    );

    await stickyConversationSessionField.click();
    await streamTimeoutField.fill("30");
    await collectSourcesField.click();

    await stickyConversationSessionField.expectChecked();
    await streamTimeoutField.expectValue("30");
    await collectSourcesField.expectChecked();

    await driver
      .expectSettings(
        (s) => s.instances[0].conversation.stickyConversationSession,
      )
      .toBe(true);
    await driver
      .expectSettings((s) => s.instances[0].conversation.streamTimeout)
      .toBe(30000);

    await driver
      .expectSettings((s) => s.instances[0].conversation.collectSources)
      .toBe(true);
  });

  it("does not emit brand concierge settings when component is disabled", async () => {
    await driver.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
        instances: [
          {
            name: "alloy",
            conversation: {
              stickyConversationSession: true,
              streamTimeout: 15000,
            },
          },
        ],
      }),
    );

    await ui.expand("Build options");
    await brandConciergeComponentCheckbox.click();

    await driver
      .expectSettings((s) => s.instances[0].conversation)
      .toBeUndefined();
  });

  it("shows alert panel when brand concierge component is disabled", async () => {
    await driver.init(buildSettings());
    await expect
      .element(
        view.getByRole("heading", {
          name: /brand concierge component disabled/i,
        }),
      )
      .toBeVisible();
  });

  it("shows alert when component is toggled off", async () => {
    await driver.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
      }),
    );

    await ui.expand("Build options");
    await brandConciergeComponentCheckbox.click();

    await expect
      .element(
        view.getByRole("heading", {
          name: /brand concierge component disabled/i,
        }),
      )
      .toBeVisible();
  });

  it("converts stream timeout from milliseconds to seconds on load", async () => {
    await driver.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
        instances: [
          {
            name: "alloy",
            conversation: {
              streamTimeout: 45000,
            },
          },
        ],
      }),
    );

    await streamTimeoutField.expectValue("45");
  });

  it("does not save stream timeout when it equals default value", async () => {
    await driver.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
      }),
    );

    await driver
      .expectSettings((s) => s.instances[0].conversation?.streamTimeout)
      .toBeUndefined();
  });

  it("does not save collectSources when it equals default value", async () => {
    await driver.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
      }),
    );

    await collectSourcesField.expectUnchecked();

    await driver
      .expectSettings((s) => s.instances[0].conversation?.collectSources)
      .toBeUndefined();
  });
});
