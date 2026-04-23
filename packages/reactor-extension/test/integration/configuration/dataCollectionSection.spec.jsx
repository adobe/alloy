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
let bridge;
let driver;
let cleanup;
let internalLinkEnabledField;
let externalLinkEnabledField;
let downloadLinkEnabledField;
let downloadLinkQualifierField;
let contextGranularitySpecificField;
let contextGranularityAllField;
let contextWebField;
let contextDeviceField;
let contextEnvironmentField;
let contextPlaceContextField;
let contextHighEntropyUserAgentHintsField;
let contextOneTimeAnalyticsReferrerField;
let eventGroupingNoneField;
let eventGroupingSessionStorageField;
let eventGroupingMemoryField;
let downloadLinkQualifierTestButton;
let downloadLinkQualifierRestoreButton;
let onBeforeEventSendEditButton;
let filterClickDetailsEditButton;
let eventGroupingRadio;
let contextCheckbox;

describe("Config data collection section", () => {
  beforeEach(async () => {
    ({ view, bridge, driver, cleanup } = await useView(ConfigurationView));
    ui = configurationUI(view);
    internalLinkEnabledField = field(
      view.getByTestId("internalLinkEnabledField"),
    );
    externalLinkEnabledField = field(
      view.getByTestId("externalLinkEnabledField"),
    );
    downloadLinkEnabledField = field(
      view.getByTestId("downloadLinkEnabledField"),
    );
    downloadLinkQualifierField = field(
      view.getByTestId("downloadLinkQualifierField"),
    );
    contextGranularitySpecificField = field(
      view.getByTestId("contextGranularitySpecificField"),
    );
    contextGranularityAllField = field(
      view.getByTestId("contextGranularityAllField"),
    );
    contextWebField = field(view.getByTestId("contextWebField"));
    contextDeviceField = field(view.getByTestId("contextDeviceField"));
    contextEnvironmentField = field(
      view.getByTestId("contextEnvironmentField"),
    );
    contextPlaceContextField = field(
      view.getByTestId("contextPlaceContextField"),
    );
    contextHighEntropyUserAgentHintsField = field(
      view.getByTestId("contextHighEntropyUserAgentHintsField"),
    );
    contextOneTimeAnalyticsReferrerField = field(
      view.getByTestId("contextOneTimeAnalyticsReferrerField"),
    );
    eventGroupingNoneField = field(view.getByTestId("eventGroupingNoneField"));
    eventGroupingSessionStorageField = field(
      view.getByTestId("eventGroupingSessionStorageField"),
    );
    eventGroupingMemoryField = field(
      view.getByTestId("eventGroupingMemoryField"),
    );
    downloadLinkQualifierTestButton = field(
      view.getByTestId("downloadLinkQualifierTestButton"),
    );
    downloadLinkQualifierRestoreButton = field(
      view.getByTestId("downloadLinkQualifierRestoreButton"),
    );
    onBeforeEventSendEditButton = field(
      view.getByTestId("onBeforeEventSendEditButton"),
    );
    filterClickDetailsEditButton = field(
      view.getByTestId("filterClickDetailsEditButton"),
    );
    eventGroupingRadio = (name) =>
      field(view.getByTestId(`eventGrouping${name}Field`));
    contextCheckbox = (name) => field(view.getByTestId(`context${name}Field`));
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
            onBeforeEventSend: "// custom code",
            clickCollection: {
              filterClickDetails: "// filter code",
            },
            context: ["web", "device"],
          },
        ],
      }),
    );

    await internalLinkEnabledField.expectChecked();

    await eventGroupingRadio("None").expectChecked();
    await eventGroupingRadio("SessionStorage").expectUnchecked();
    await eventGroupingRadio("Memory").expectUnchecked();

    await externalLinkEnabledField.expectChecked();
    await downloadLinkEnabledField.expectChecked();

    await contextGranularitySpecificField.expectChecked();

    await contextCheckbox("Web").expectChecked();
    await contextCheckbox("Device").expectChecked();
    await contextCheckbox("Environment").expectUnchecked();
    await contextCheckbox("PlaceContext").expectUnchecked();
    await contextHighEntropyUserAgentHintsField.expectUnchecked();
    await contextOneTimeAnalyticsReferrerField.expectUnchecked();
  });

  it("sets form values from settings with event grouping session storage", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            clickCollection: {
              sessionStorageEnabled: true,
              eventGroupingEnabled: true,
            },
          },
        ],
      }),
    );

    await internalLinkEnabledField.expectChecked();

    await eventGroupingRadio("None").expectUnchecked();
    await eventGroupingRadio("SessionStorage").expectChecked();
    await eventGroupingRadio("Memory").expectUnchecked();
  });

  it("sets form values from settings with event grouping memory", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            clickCollection: {
              eventGroupingEnabled: true,
            },
          },
        ],
      }),
    );

    await internalLinkEnabledField.expectChecked();

    await eventGroupingRadio("None").expectUnchecked();
    await eventGroupingRadio("SessionStorage").expectUnchecked();
    await eventGroupingRadio("Memory").expectChecked();
  });

  it("sets form values from settings with download link enabled", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            downloadLinkQualifier: "\\.(exe|zip)$",
          },
        ],
      }),
    );

    await downloadLinkEnabledField.expectChecked();
    await downloadLinkQualifierField.expectValue("\\.(exe|zip)$");
  });

  it("sets form values from settings with all link types disabled", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            clickCollectionEnabled: false,
          },
        ],
      }),
    );

    await internalLinkEnabledField.expectUnchecked();
    await externalLinkEnabledField.expectUnchecked();
    await downloadLinkEnabledField.expectUnchecked();
  });

  it("sets form values from settings with some link types disabled", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            clickCollection: {
              externalLinkEnabled: false,
              downloadLinkEnabled: false,
            },
          },
        ],
      }),
    );

    await internalLinkEnabledField.expectChecked();
    await externalLinkEnabledField.expectUnchecked();
    await downloadLinkEnabledField.expectUnchecked();
  });

  it("updates form values and saves to settings", async () => {
    await driver.init(buildSettings());

    await externalLinkEnabledField.click();
    await downloadLinkEnabledField.click();

    await contextGranularitySpecificField.click();

    await contextWebField.click();

    await driver
      .expectSettings((s) => s.instances[0].clickCollection.externalLinkEnabled)
      .toBe(false);
    await driver
      .expectSettings((s) => s.instances[0].clickCollection.downloadLinkEnabled)
      .toBe(false);
    await driver
      .expectSettings((s) => s.instances[0].context)
      .toEqual(["device", "environment", "placeContext"]);
  });

  it("shows and hides download link qualifier based on download link enabled", async () => {
    await driver.init(buildSettings());

    await downloadLinkQualifierField.expectVisible();

    await downloadLinkEnabledField.click();

    await downloadLinkQualifierField.expectHidden();
  });

  it("shows and hides event grouping options based on internal link enabled", async () => {
    await driver.init(buildSettings());

    await eventGroupingNoneField.expectVisible();

    await internalLinkEnabledField.click();

    await eventGroupingNoneField.expectHidden();
  });

  it("saves event grouping settings when session storage is selected", async () => {
    await driver.init(buildSettings());

    await eventGroupingSessionStorageField.click();

    await driver
      .expectSettings(
        (s) => s.instances[0].clickCollection.eventGroupingEnabled,
      )
      .toBe(true);
    await driver
      .expectSettings(
        (s) => s.instances[0].clickCollection.sessionStorageEnabled,
      )
      .toBe(true);
  });

  it("saves event grouping settings when memory is selected", async () => {
    await driver.init(buildSettings());

    await eventGroupingMemoryField.click();

    await driver
      .expectSettings(
        (s) => s.instances[0].clickCollection.eventGroupingEnabled,
      )
      .toBe(true);
    await driver
      .expectSettings(
        (s) => s.instances[0].clickCollection.sessionStorageEnabled,
      )
      .toBeUndefined();
  });

  it("does not emit click collection settings when activity collector is disabled", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            clickCollectionEnabled: true,
            clickCollection: {
              internalLinkEnabled: true,
              externalLinkEnabled: true,
              downloadLinkEnabled: true,
            },
            downloadLinkQualifier: "\\.(pdf)$",
          },
        ],
      }),
    );

    await ui.toggleComponent("activityCollector");

    await driver
      .expectSettings((s) => s.instances[0].clickCollectionEnabled)
      .toBeUndefined();
    await driver
      .expectSettings((s) => s.instances[0].clickCollection)
      .toBeUndefined();
    await driver
      .expectSettings((s) => s.instances[0].downloadLinkQualifier)
      .toBeUndefined();
  });

  it("hides click collection fields and shows alert when activity collector is disabled", async () => {
    await driver.init(buildSettings({}));

    await ui.toggleComponent("activityCollector");

    await expect
      .element(
        view.getByRole("heading", {
          name: /activity collector component disabled/i,
        }),
      )
      .toBeVisible();

    await internalLinkEnabledField.expectHidden();
  });

  it("shows default values when no settings are provided", async () => {
    await driver.init(buildSettings());

    await internalLinkEnabledField.expectChecked();
    await externalLinkEnabledField.expectChecked();
    await downloadLinkEnabledField.expectChecked();

    await contextGranularityAllField.expectChecked();
    await eventGroupingNoneField.expectChecked();
  });

  it("does not save default values to settings", async () => {
    await driver.init(buildSettings());

    await driver
      .expectSettings((s) => s.instances[0].onBeforeEventSend)
      .toBeUndefined();
    await driver
      .expectSettings((s) => s.instances[0].clickCollection)
      .toBeUndefined();
    await driver
      .expectSettings((s) => s.instances[0].downloadLinkQualifier)
      .toBeUndefined();
    await driver.expectSettings((s) => s.instances[0].context).toBeUndefined();
  });

  it("updates download link qualifier", async () => {
    await driver.init(buildSettings());

    await downloadLinkQualifierField.fill("\\.(zip|exe)$");

    await driver
      .expectSettings((s) => s.instances[0].downloadLinkQualifier)
      .toBe("\\.(zip|exe)$");
  });

  it("shows context checkboxes when specific context is selected", async () => {
    await driver.init(buildSettings());

    await contextWebField.expectHidden();

    await contextGranularitySpecificField.click();

    await contextWebField.expectVisible();
    await contextDeviceField.expectVisible();
    await contextEnvironmentField.expectVisible();
    await contextPlaceContextField.expectVisible();
    await contextHighEntropyUserAgentHintsField.expectVisible();
    await contextOneTimeAnalyticsReferrerField.expectVisible();
  });

  it("saves non-default context when specific is selected", async () => {
    await driver.init(buildSettings());

    await contextGranularitySpecificField.click();

    await contextEnvironmentField.click();

    await contextHighEntropyUserAgentHintsField.click();

    await contextOneTimeAnalyticsReferrerField.click();

    await driver
      .expectSettings((s) => s.instances[0].context)
      .toEqual([
        "web",
        "device",
        "placeContext",
        "highEntropyUserAgentHints",
        "oneTimeAnalyticsReferrer",
      ]);
  });

  it("loads context options from settings", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            context: ["web", "device", "oneTimeAnalyticsReferrer"],
          },
        ],
      }),
    );

    await contextGranularitySpecificField.expectChecked();

    await contextWebField.expectChecked();
    await contextDeviceField.expectChecked();
    await contextEnvironmentField.expectUnchecked();
    await contextPlaceContextField.expectUnchecked();
    await contextHighEntropyUserAgentHintsField.expectUnchecked();
    await contextOneTimeAnalyticsReferrerField.expectChecked();
  });

  it("disables click collection when all link types are disabled", async () => {
    await driver.init(buildSettings());

    await internalLinkEnabledField.click();
    await externalLinkEnabledField.click();
    await downloadLinkEnabledField.click();

    await driver
      .expectSettings((s) => s.instances[0].clickCollectionEnabled)
      .toBe(false);
  });

  it("sets download link qualifier when test button is clicked", async () => {
    await driver.init(buildSettings());

    await downloadLinkQualifierTestButton.click();

    await downloadLinkQualifierField.expectValue(/edited regex/i);
  });

  it("does not save onBeforeEventSend code if it matches placeholder", async () => {
    bridge.openCodeEditorMock = async ({ code }) => code;

    await driver.init(buildSettings());

    await onBeforeEventSendEditButton.click();

    await driver
      .expectSettings((s) => s.instances[0].onBeforeEventSend)
      .toBeUndefined();
  });

  it("does not save filterClickDetails code if it matches placeholder", async () => {
    bridge.openCodeEditorMock = async ({ code }) => code;

    await driver.init(buildSettings());

    await filterClickDetailsEditButton.click();

    await driver
      .expectSettings((s) => s.instances[0].clickCollection?.filterClickDetails)
      .toBeUndefined();
  });

  describe("restore default buttons", () => {
    it("restores default download link qualifier when button is clicked", async () => {
      await driver.init(buildSettings());

      const originalDownloadLinkQualifier =
        await downloadLinkQualifierField.getValue();
      await downloadLinkQualifierField.fill("\\.(exe|zip)$");

      await downloadLinkQualifierField.expectValue("\\.(exe|zip)$");

      await downloadLinkQualifierRestoreButton.click({
        position: { x: 10, y: 10 },
      });

      await downloadLinkQualifierField.expectValue(
        originalDownloadLinkQualifier,
      );
    });
  });

  describe("validation", () => {
    it("validates download link qualifier regex format", async () => {
      await driver.init(
        buildSettings({
          instances: [
            {
              name: "alloy",
              downloadLinkQualifier: "[(invalid regex",
            },
          ],
        }),
      );

      await driver.expectValidate().toBe(false);
    });

    it("accepts valid download link qualifier regex", async () => {
      await driver.init(
        buildSettings({
          instances: [
            {
              name: "alloy",
              downloadLinkQualifier: "\\.(pdf|doc)$",
            },
          ],
        }),
      );

      await driver.expectValidate().toBe(true);
    });

    it("requires download link qualifier when download link is enabled", async () => {
      await driver.init(
        buildSettings({
          instances: [
            {
              name: "alloy",
              downloadLinkQualifier: "",
              clickCollection: {
                downloadLinkEnabled: true,
              },
            },
          ],
        }),
      );

      await downloadLinkQualifierField.clear();

      await driver.expectValidate().toBe(false);
    });
  });
});
