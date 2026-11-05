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
  environments,
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
    ["empty", {}],
    ["minimal", { instances: [minimalInstance] }],
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
      "preinstalled",
      {
        libraryCode: { type: "preinstalled" },
        instances: [{ name: "alloy" }, { name: "secondary" }],
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
      "full without callbacks",
      {
        components,
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
      "duplicate instances without saved sandboxes",
      {
        instances: [
          { name: "alloy", edgeConfigId: "ds-prod" },
          { name: "alloy", edgeConfigId: "ds-prod" },
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

  it.each([
    ["single instance", [validInstance]],
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
    },
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
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each([
    ["three environments", {}],
    ["disabled components", { components: disabledComponents }],
    [
      "development datastream data element",
      { developmentEdgeConfigId: "%stream%" },
    ],
    ["legacy callback", { onBeforeLinkClickSend: "content.xdm.web = {};" }],
  ])(
    "shows first-validation override feedback with %s",
    async (_, { components: savedComponents, ...instanceSettings }) => {
      const development = reportSuiteOverride([
        "not-allowed",
        "",
        "%suite%",
      ]).development;
      await init({
        ...(savedComponents && { components: savedComponents }),
        instances: [
          {
            ...minimalInstance,
            ...instanceSettings,
            edgeConfigOverrides: Object.fromEntries(
              environments.map((env) => [env, development]),
            ),
          },
        ],
      });
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it.each([
    ["disabled components", { components: disabledComponents }],
    [
      "self-hosted extension",
      { components, libraryCode: { type: "preinstalled" } },
    ],
  ])("round trips settings in the %s context", async (_, extensionSettings) => {
    await init({ instances: [minimalInstance] }, { extensionSettings });
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

  it.each(editCases)("edits %s through %j", async (id, values, settings) => {
    await init(settings);
    if (id === "advertiser0Field") {
      await control(id).expectValue("Advertiser BF");
    }
    for (const value of values) {
      // eslint-disable-next-line no-await-in-loop
      await control(id).fill(value);
      // eslint-disable-next-line no-await-in-loop
      expect(await captureState(bridge)).toMatchSnapshot();
    }
  });

  it.each([
    [
      "personalization",
      [
        "idMigrationEnabledField",
        "targetMigrationEnabledField",
        "personalizationStorageEnabledField",
      ],
    ],
    [
      "activityCollector",
      [
        "internalLinkEnabledField",
        "externalLinkEnabledField",
        "downloadLinkEnabledField",
        "contextWebField",
        "contextDeviceField",
        "contextEnvironmentField",
        "contextPlaceContextField",
        "contextHighEntropyUserAgentHintsField",
        "contextOneTimeAnalyticsReferrerField",
      ],
    ],
    [
      "brandConcierge",
      ["stickyConversationSessionField", "collectSourcesDataTestId"],
    ],
  ])("toggles %s options", async (component, ids) => {
    await init(
      settingsForComponents(
        component,
        ...(component === "personalization" ? ["rulesEngine"] : []),
      ),
    );
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      await control(id).click();
      // eslint-disable-next-line no-await-in-loop
      expect(await captureState(bridge)).toMatchSnapshot();
    }
  });

  it("disables and restores each populated component independently", async () => {
    await init({ components, instances: [editableInstance] });
    for (const component of Object.keys(components)) {
      // eslint-disable-next-line no-await-in-loop
      await configurationUI(view).toggleComponent(component);
      // eslint-disable-next-line no-await-in-loop
      expect(await captureState(bridge)).toMatchSnapshot();
      // eslint-disable-next-line no-await-in-loop
      await configurationUI(view).toggleComponent(component);
    }
  }, 60_000);

  it.each([
    [
      "defaultConsentDataElementRadio",
      "defaultConsentDataElementField",
      "consent",
    ],
    [
      "transferCookiesDataElementOption",
      "transferCookiesDataElementField",
      "brandConcierge",
    ],
  ])(
    "switches %s through empty, invalid and valid data elements",
    async (radio, input, component) => {
      await init(settingsForComponents(component));
      await control(radio).click();
      await control(input).clear();
      expect(await captureState(bridge)).toMatchSnapshot();
      await control(input).fill("not a data element");
      expect(await captureState(bridge)).toMatchSnapshot();
      await control(input).fill("%edited%");
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it("selects cookie and advertising options", async () => {
    await init(settingsForComponents("advertising"));
    await control("thirdPartyCookiesEnabledField").selectOption("Enabled");
    expect(await captureState(bridge)).toMatchSnapshot();
    await control("dspEnabledField").selectOption("Disabled");
    expect(await captureState(bridge)).toMatchSnapshot();
    await control("advertisingEnabledField").selectOption("Disabled");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

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
  });

  it("adds, trims and removes transfer cookie rows", async () => {
    await init(settingsForComponents("brandConcierge"));
    await control("addTransferCookieButton").click();
    expect(await captureState(bridge)).toMatchSnapshot();
    await control("transferCookie4Field").fill("  new-cookie  ");
    expect(await captureState(bridge)).toMatchSnapshot();
    await control("deleteTransferCookie0Button").click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("adds, selects, duplicates and removes advertiser rows", async () => {
    await init(settingsForComponents("advertising"));
    await control("advertiser0Field").expectValue("Advertiser BF");
    await control("addAdvertiserButton").click();
    expect(await captureState(bridge)).toMatchSnapshot();
    await control("advertiser2Field").selectOption("Advertiser BF");
    expect(await captureState(bridge)).toMatchSnapshot();
    await control("deleteAdvertiser0Button").click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("adds and edits an instance, selects another instance and rejects duplicate names", async () => {
    await init({ instances: [minimalInstance] });
    await control("addInstanceButton").click();
    await control("nameField").expectValue("alloy2");
    expect(await captureState(bridge)).toMatchSnapshot();
    await view.getByRole("tab", { name: "alloy2", exact: true }).click();
    await control("nameField").fill("third");
    await control("orgIdField").fill("THIRD@AdobeOrg");
    await control("productionDatastreamField").fill("%thirdStream%");
    expect(await captureState(bridge)).toMatchSnapshot();
    await view.getByRole("tab", { name: "alloy", exact: true }).click();
    await control("nameField").fill("third");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("edits the selected foreign-org instance without changing the first instance", async () => {
    await init({ instances: [minimalInstance, secondaryInstance], components });
    await view.getByRole("tab", { name: "secondary", exact: true }).click();
    await control("orgIdField").fill("EDITED@AdobeOrg");
    await control("productionDatastreamField").fill("%secondaryStream%");
    expect(await captureState(bridge)).toMatchSnapshot();
    await view.getByRole("tab", { name: "secondary", exact: true }).click();
    await control("nameField").fill("alloy");
    expect(await captureState(bridge)).toMatchSnapshot();
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
    expect(await captureState(bridge)).toMatchSnapshot();
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
    for (const value of ["-1", "1.5", "abc", "prefix%id%", "12%id%", ""]) {
      // eslint-disable-next-line no-await-in-loop
      await control("idSyncContainerOverride").fill(value);
      // eslint-disable-next-line no-await-in-loop
      expect(await captureState(bridge)).toMatchSnapshot();
    }
    await control("analyticsEnabled").fill("invalid");
    expect(await captureState(bridge)).toMatchSnapshot();
    await control("analyticsEnabled").fill("%bad");
    expect(await captureState(bridge)).toMatchSnapshot();
  }, 60_000);

  it.each(environments)(
    "edits %s overrides and report-suite rows",
    async (env) => {
      await init({ instances: [minimalInstance] }, { preconfigured: true });
      await control(`${env}OverridesTab`).click();
      await control("overridesEnabled").selectOption("Enabled");
      await control("analyticsEnabled").selectOption("Enabled");
      await control("reportSuitesOverride.0").expectVisible();
      await control("reportSuitesOverride.0").fill("not-allowed-again");
      expect(await captureState(bridge)).toMatchSnapshot();
      await control(`${env}OverridesTab`).click();
      await control("reportSuitesOverride.0").fill("%suite%");
      await control("addReportSuite").click();
      await control("reportSuitesOverride.1").fill(`suite-${env}`);
      await control("idSyncContainerOverride").fill("%container%");
      await control("targetEnabled").selectOption("Enabled");
      await control("targetPropertyTokenOverride").fill("%target%");
      await control("experiencePlatformEnabled").selectOption("Enabled");
      await control("eventDatasetOverride").fill("%dataset%");
      expect(await captureState(bridge)).toMatchSnapshot();
      await control("removeReportSuite.0").click();
      expect(await captureState(bridge)).toMatchSnapshot();
      await control("overridesEnabled").selectOption("No override");
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );
});
