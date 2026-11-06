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

import { describe, it, beforeEach, afterEach, expect } from "vitest";

import ConfigurationView from "../../../src/view/configuration/configurationView";
import useView from "../helpers/useView";
import captureState from "../helpers/captureState";
import field from "../helpers/field";
import configurationUI from "../helpers/ui/configurationUI";
import { worker } from "../helpers/mocks/browser";
import {
  orgId,
  components,
  disabledComponents,
  minimalInstance,
  fullInstance,
  validInstance,
  secondaryInstance,
  reportSuiteOverride,
  editCases,
  configurationHandlers,
} from "../helpers/configurationSnapshots";

let view;
let bridge;
let driver;
let cleanup;

const control = (id) => field(view.getByTestId(id));

const editableInstance = { ...validInstance, edgeConfigOverrides: undefined };

const settingsForComponents = (...enabled) => ({
  components: {
    ...disabledComponents,
    ...Object.fromEntries(enabled.map((name) => [name, true])),
  },
  instances: [editableInstance],
});

const init = async (settings, { preconfigured = false, ...initInfo } = {}) => {
  worker.use(...configurationHandlers({ preconfigured }));
  await driver.init({
    company: { orgId },
    settings: structuredClone(settings),
    ...initInfo,
  });
  if (settings?.libraryCode?.type !== "preinstalled") {
    await field(
      view.getByRole("button", { name: "Refresh datastreams" }).first(),
    ).expectEnabled();
    if (settings?.instances?.[0]?.edgeConfigOverrides?.development?.enabled) {
      await expect
        .element(
          view.getByTestId("reportSuitesOverride.0").getByRole("combobox"),
        )
        .toBeVisible();
    }
  }
};

describe("Configuration settings snapshots", () => {
  beforeEach(async () => {
    ({ view, bridge, driver, cleanup } = await useView(ConfigurationView));
  });

  afterEach(() => {
    cleanup();
  });

  it.each([
    ["new", null],
    ["full", { components, instances: [fullInstance, secondaryInstance] }],
    [
      "data elements",
      {
        components,
        instances: [
          {
            ...fullInstance,
            defaultConsent: "%consent%",
            thirdPartyCookiesEnabled: "%cookies%",
            edgeConfigId: "%stream%",
            sandbox: "",
            conversation: { region: "va7", transferCookies: "%cookies%" },
            advertising: {
              enabled: "%ads%",
              dspEnabled: "%dsp%",
              id5PartnerId: "%id5%",
              rampIdJSPath: "%ramp%",
              advertiserSettings: [
                {
                  advertiserId: "%advertiser%",
                  enabled: "%advertiserEnabled%",
                },
              ],
            },
          },
        ],
      },
    ],
    [
      "legacy overrides and click collection",
      {
        components,
        instances: [
          {
            name: "alloy",
            edgeConfigId: "ds-prod",
            clickCollectionEnabled: false,
            thirdPartyCookiesEnabled: true,
            autoCollectPropositionInteractions: {
              AJO: "decoratedElementsOnly",
              TGT: "always",
            },
            edgeConfigOverrides: {
              com_adobe_analytics: { enabled: true, reportSuites: ["suite"] },
              com_adobe_identity: { idSyncContainerId: 12 },
              com_adobe_audience_manager: { enabled: false },
            },
          },
        ],
      },
    ],
    [
      "legacy library settings",
      {
        librarySettings: { type: "preinstalled" },
        instances: [{ name: "alloy", edgeConfigId: "ds-prod" }],
      },
    ],
    [
      "disabled components",
      { components: disabledComponents, instances: [fullInstance] },
    ],
    [
      "disabled components without callbacks",
      {
        components: disabledComponents,
        instances: [
          { ...fullInstance, onBeforeLinkClickSend: "", onBeforeEventSend: "" },
        ],
      },
    ],
    [
      "legacy advertising and component shapes",
      {
        components: {
          consent: true,
          personalization: true,
          clickCollection: true,
          context: true,
          identity: true,
          audienceManager: true,
          advertising: true,
        },
        instances: [
          {
            ...minimalInstance,
            advertising: {
              enabled: true,
              dspEnabled: true,
              searchEnabled: true,
              advertisers: [
                {
                  advertiserId: "167524",
                  trackingServer: "tracking.example.com",
                },
              ],
            },
          },
        ],
      },
    ],
    [
      "invalid values",
      {
        components,
        instances: [
          {
            ...fullInstance,
            name: "123",
            edgeDomain: "",
            thirdPartyCookiesEnabled: "invalid",
            conversation: { region: "bad", streamTimeout: 5000 },
            streamingMedia: {
              channel: "Web",
              playerName: "",
              adPingInterval: 0,
              mainPingInterval: 70,
            },
          },
        ],
      },
    ],
  ])(
    "round trips %s settings before the first validation",
    async (_, settings) => {
      await init(settings);
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it("round trips duplicate instances without saved sandboxes settings before the first validation", async () => {
    await init({
      instances: [
        { name: "alloy", edgeConfigId: "ds-prod" },
        { name: "alloy", edgeConfigId: "ds-prod" },
      ],
    });
    expect(await captureState(bridge)).toMatchSnapshot();
    await view.getByRole("tab", { name: "alloy", exact: true }).nth(1).click();
    await control("nameField").fill("secondary");
    await control("orgIdField").fill("SECOND@AdobeOrg");
    await control("productionDatastreamField").fill("%secondaryStream%");
    await control("addInstanceButton").click();
    await control("nameField").fill("third");
    await control("orgIdField").fill("THIRD@AdobeOrg");
    await control("productionDatastreamField").fill("%thirdStream%");
    const registration = await bridge.registration;
    expect(await registration.validate()).toBe(true);
    expect((await registration.getSettings()).instances).toEqual([
      minimalInstance,
      {
        name: "secondary",
        orgId: "SECOND@AdobeOrg",
        edgeConfigId: "%secondaryStream%",
      },
      { name: "third", orgId: "THIRD@AdobeOrg", edgeConfigId: "%thirdStream%" },
    ]);
  }, 60_000);

  it.each([
    [
      "multiple instances",
      [
        validInstance,
        {
          ...validInstance,
          name: "secondary",
          orgId: "SECOND@AdobeOrg",
          edgeConfigId: "ds-other",
        },
      ],
    ],
  ])(
    "round trips valid fully populated settings with %s",
    async (_, instances) => {
      await init({ components, instances }, { preconfigured: true });
      await control("reportSuitesOverride.0").expectEnabled();
      expect(await captureState(bridge)).toMatchSnapshot();

      const registration = await bridge.registration;
      await control("productionOverridesTab").click();
      await control("targetPropertyTokenOverride").fill("%target%");
      await control("eventDatasetOverride").fill("%dataset%");
      expect(
        (await registration.getSettings()).instances[0].edgeConfigOverrides
          .production,
      ).toMatchObject({
        com_adobe_target: { propertyToken: "%target%" },
        com_adobe_experience_platform: {
          datasets: { event: { datasetId: "%dataset%" } },
        },
      });
      await control("overridesEnabled").selectOption("No override");
      expect(
        (await registration.getSettings()).instances[0].edgeConfigOverrides,
      ).not.toHaveProperty("production");
      await configurationUI(view).toggleComponent("activityCollector");
      const disabled = await registration.getSettings();
      expect(disabled.components.activityCollector).toBe(false);
      expect(disabled.instances[0]).not.toHaveProperty("clickCollection");
    },
    60_000,
  );

  it("shows the grouped legacy callback report-suite error on the first validation", async () => {
    await init({
      instances: [
        {
          ...minimalInstance,
          onBeforeLinkClickSend: "content.xdm.web = {};",
          clickCollection: {
            eventGroupingEnabled: true,
            sessionStorageEnabled: true,
          },
          edgeConfigOverrides: reportSuiteOverride(["not-allowed"]),
        },
      ],
    });
    await control("reportSuitesOverride.0").expectEnabled();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("does not retain report-suite errors after deleting the authenticated-org instance", async () => {
    await init({
      instances: [
        {
          ...minimalInstance,
          orgId,
          edgeConfigOverrides: reportSuiteOverride(["suite"]),
        },
        {
          name: "secondary",
          orgId: "SECOND@AdobeOrg",
          edgeConfigId: "ds-other",
          edgeConfigOverrides: reportSuiteOverride(["external-suite"]),
        },
      ],
    });
    await control("reportSuitesOverride.0").expectEnabled();
    await control("deleteInstanceButton").click();
    await control("confirmDeleteInstanceButton").click();
    await control("nameField").expectValue("secondary");
    await control("reportSuitesOverride.0").expectValue("external-suite");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(editCases)(
    "edits %s through %j",
    async (id, values, settings, captureCount) => {
      await init(settings);
      for (const value of values.slice(0, captureCount)) {
        // eslint-disable-next-line no-await-in-loop
        await control(id).fill(value);
        // eslint-disable-next-line no-await-in-loop
        expect(await captureState(bridge)).toMatchSnapshot();
      }
      if (id === "mediaMainPingIntervalField") {
        await control("mediaAdPingIntervalField").fill("0");
        await control("mediaAdPingIntervalField").expectError(
          "The Ad Ping Interval must be greater than 1 second.",
        );
      }
    },
  );

  it("selects datastreams and sandboxes for every environment, then clears them", async () => {
    await init({ instances: [minimalInstance] });
    await control("productionDatastreamField").selectOption("Staging stream");
    await control("stagingDatastreamField").selectOption("Development stream");
    await control("developmentDatastreamField").selectOption(
      "Second sandbox stream",
    );
    expect(await captureState(bridge)).toMatchSnapshot();
    await control("productionDatastreamField").fill("%productionStream%");
    await control("stagingDatastreamField").clear();
    await control("developmentDatastreamField").clear();
    expect(await captureState(bridge)).toMatchSnapshot();

    // Keep distinct feedback checks without another mount or a full settings snapshot per field.
    await control("nameField").fill("");
    await control("orgIdField").fill("");
    await control("edgeDomainField").fill("");
    await control("downloadLinkQualifierField").fill("");
    await control("mediaPlayerNameField").fill("Player");
    await control("defaultConsentDataElementRadio").click();
    await control("defaultConsentDataElementField").fill("not a data element");
    await configurationUI(view).toggleComponent("brandConcierge");
    await control("transferCookiesDataElementOption").click();
    await control("transferCookiesDataElementField").fill("not a data element");
    const invalid = await captureState(bridge);
    expect(invalid.valid).toBe(false);
    expect(invalid.errors).toEqual(
      expect.arrayContaining(
        [
          ["Name", "Please specify a name."],
          ["IMS organization ID", "Please specify an IMS organization ID."],
          ["Edge domain", "Please specify an edge domain."],
          ["Download link qualifier", "Please provide a regular expression."],
          ["Channel", "Please provide a channel name for streaming media."],
          ["Data element", "Please specify a data element."],
          [
            "Transfer cookies data element",
            "Please provide a single data element, for example %myDataElement%.",
          ],
        ].map(([fieldName, message]) =>
          expect.objectContaining({ field: fieldName, messages: [message] }),
        ),
      ),
    );
    await control("defaultConsentDataElementField").fill("%edited%");
    await control("transferCookiesDataElementField").fill("%edited%");
    const registration = await bridge.registration;
    expect((await registration.getSettings()).instances[0]).toMatchObject({
      defaultConsent: "%edited%",
      conversation: { transferCookies: "%edited%" },
    });
  }, 60_000);

  it("adds, selects, duplicates and removes advertiser rows", async () => {
    await init(settingsForComponents("advertising"));
    await control("advertiser0Field").expectValue("Advertiser BF");
    await control("addAdvertiserButton").click();
    expect(await captureState(bridge)).toMatchSnapshot();
    await control("advertiser2Field").selectOption("Advertiser BF");
    expect(await captureState(bridge)).toMatchSnapshot();
    await control("deleteAdvertiser0Button").click();
    const registration = await bridge.registration;
    expect(await registration.validate()).toBe(true);
    expect(
      (await registration.getSettings()).instances[0].advertising
        .advertiserSettings,
    ).toEqual([
      { advertiserId: "83565", enabled: false },
      { advertiserId: "167524", enabled: true },
    ]);
    await control("advertiser0Field").fill("not a data element");
    await control("advertiser0Field").expectError(
      "Unrecognized advertiser ID.",
    );
    await control("thirdPartyCookiesEnabledField").selectOption("Enabled");
    await control("dspEnabledField").selectOption("Disabled");
    await control("advertisingEnabledField").selectOption("Disabled");
    const selected = (await registration.getSettings()).instances[0];
    expect(selected.advertising).toMatchObject({
      enabled: false,
      dspEnabled: false,
    });
    expect(selected).not.toHaveProperty("thirdPartyCookiesEnabled");
  });

  it("deletes the first fully populated instance and preserves the remaining invalid settings", async () => {
    await init({ components, instances: [fullInstance, secondaryInstance] });
    await control("deleteInstanceButton").click();
    await control("confirmDeleteInstanceButton").click();
    await control("nameField").expectValue("secondary");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches a populated configuration to preinstalled library mode and back", async () => {
    await init({
      components,
      instances: [editableInstance, secondaryInstance],
    });
    await configurationUI(view).expand("Build options");
    await view
      .getByText("Use a self-hosted alloy.js instance", { exact: true })
      .click();
    expect(await captureState(bridge)).toMatchSnapshot();
    await control("nameField").fill("123");
    expect(await captureState(bridge)).toMatchSnapshot();
    await control("nameField").fill("alloy");
    await view.getByText("Managed by Adobe Tags", { exact: true }).click();
    await control("productionDatastreamField").expectVisible();
  });

  it("validates numeric and service override inputs", async () => {
    await init(
      {
        instances: [
          {
            ...minimalInstance,
            edgeConfigOverrides: reportSuiteOverride(["suite"]),
          },
        ],
      },
      { preconfigured: true },
    );
    await control("idSyncContainerOverride").fill("-1");
    expect(await captureState(bridge)).toMatchSnapshot();
    const registration = await bridge.registration;
    for (const [value, message] of [
      ["1.5", "The value must whole number."],
      ["abc", "The value must positive, whole number."],
      ["prefix%id%", "The value must contain one or more valid data elements."],
    ]) {
      // eslint-disable-next-line no-await-in-loop
      await control("idSyncContainerOverride").fill(value);
      // eslint-disable-next-line no-await-in-loop
      expect(await registration.validate()).toBe(false);
      // eslint-disable-next-line no-await-in-loop
      await control("idSyncContainerOverride").expectError(message);
    }
    await control("idSyncContainerOverride").fill("12%id%");
    expect(await registration.validate()).toBe(true);
    expect(
      (await registration.getSettings()).instances[0].edgeConfigOverrides
        .development.com_adobe_identity.idSyncContainerId,
    ).toBe(12);
    await control("idSyncContainerOverride").clear();
    expect(await registration.validate()).toBe(true);
    expect(
      (await registration.getSettings()).instances[0].edgeConfigOverrides
        .development,
    ).not.toHaveProperty("com_adobe_identity.idSyncContainerId");
    await control("analyticsEnabled").fill("invalid");
    expect(await registration.validate()).toBe(false);
    await control("analyticsEnabled").expectError(
      "The value must be 'Enabled', 'Disabled', 'No override' or a single data element.",
    );
    await control("analyticsEnabled").fill("%bad");
    expect(await registration.validate()).toBe(false);
    await control("analyticsEnabled").expectError(
      "The value must be a valid data element.",
    );
  }, 60_000);
});
