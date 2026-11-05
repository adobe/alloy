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

import { http, HttpResponse } from "msw";

export const orgId = "PARITY@AdobeOrg";
export const environments = ["development", "staging", "production"];
export const components = Object.fromEntries(
  [
    "activityCollector",
    "advertising",
    "audiences",
    "brandConcierge",
    "consent",
    "eventMerge",
    "mediaAnalyticsBridge",
    "personalization",
    "pushNotifications",
    "rulesEngine",
    "streamingMedia",
  ].map((name) => [name, true]),
);
export const disabledComponents = Object.fromEntries(
  Object.keys(components).map((name) => [name, false]),
);

export const overrides = Object.fromEntries(
  environments.map((env, index) => [
    env,
    {
      enabled: true,
      datastreamId: `ds-${env}`,
      sandbox: "prod",
      com_adobe_experience_platform: {
        datasets: { event: { datasetId: `dataset-${env}` } },
        com_adobe_edge_ode: { enabled: false },
        com_adobe_edge_segmentation: { enabled: false },
        com_adobe_edge_destinations: { enabled: false },
        com_adobe_edge_ajo: { enabled: false },
      },
      com_adobe_analytics: { reportSuites: [`suite-${env}`, "", "%suite%"] },
      com_adobe_identity: { idSyncContainerId: index + 1 },
      com_adobe_target: { propertyToken: `token-${env}` },
      com_adobe_audiencemanager: { enabled: false },
      com_adobe_launch_ssf: { enabled: false },
    },
  ]),
);

export const minimalInstance = {
  name: "alloy",
  edgeConfigId: "ds-prod",
  sandbox: "prod",
};

export const fullInstance = {
  ...minimalInstance,
  orgId,
  edgeDomain: "collect.example.com",
  edgeBasePath: "custom",
  stagingEdgeConfigId: "ds-staging",
  stagingSandbox: "prod",
  developmentEdgeConfigId: "%developmentStream%",
  defaultConsent: "pending",
  idMigrationEnabled: false,
  thirdPartyCookiesEnabled: false,
  prehidingStyle: "body { opacity: 0; }",
  targetMigrationEnabled: true,
  personalizationStorageEnabled: true,
  autoCollectPropositionInteractions: {
    AJO: "never",
    TGT: "decoratedElementsOnly",
  },
  onBeforeEventSend: "content.xdm.test = true;",
  onBeforeLinkClickSend: "content.xdm.web = {};",
  downloadLinkQualifier: "\\.pdf$",
  context: ["web", "device", "highEntropyUserAgentHints"],
  clickCollection: {
    internalLinkEnabled: false,
    externalLinkEnabled: true,
    downloadLinkEnabled: true,
    eventGroupingEnabled: true,
    sessionStorageEnabled: true,
  },
  streamingMedia: {
    channel: "Web",
    playerName: "Player",
    appVersion: "1.2",
    adPingInterval: 3,
    mainPingInterval: 30,
  },
  pushNotifications: {
    vapidPublicKey: "public-key",
    appId: "app-1",
    trackingDatasetId: "dataset-1",
  },
  conversation: {
    region: "va7",
    stickyConversationSession: true,
    collectSources: true,
    streamTimeout: 20000,
    transferCookies: [" a ", "", "b", "%cookie%"],
  },
  advertising: {
    enabled: true,
    dspEnabled: true,
    id5PartnerId: "partner",
    rampIdJSPath: "https://example.com/ramp.js",
    advertiserSettings: [
      { advertiserId: "167524", enabled: true },
      { advertiserId: "83565", enabled: false },
    ],
  },
  edgeConfigOverrides: overrides,
};

export const validInstance = {
  ...fullInstance,
  onBeforeLinkClickSend: "",
  clickCollection: {
    ...fullInstance.clickCollection,
    eventGroupingEnabled: false,
    sessionStorageEnabled: false,
    filterClickDetails: 'content.linkName = "clicked";',
  },
};

export const secondaryInstance = {
  ...fullInstance,
  name: "secondary",
  orgId: "SECOND@AdobeOrg",
  edgeConfigId: "ds-other",
  sandbox: undefined,
  stagingEdgeConfigId: "",
  stagingSandbox: "",
  developmentEdgeConfigId: "",
};

export const reportSuiteOverride = (reportSuites) => ({
  development: {
    enabled: true,
    datastreamId: "ds-prod",
    sandbox: "prod",
    com_adobe_analytics: { reportSuites },
  },
});

export const editCases = [
  {
    instance: {
      ...minimalInstance,
      edgeDomain: fullInstance.edgeDomain,
      thirdPartyCookiesEnabled: false,
    },
    fields: [
      ["nameField", ["%edited%", "", "not a data element"]],
      ["orgIdField", ["%edited%", "", "not a data element"]],
      ["edgeDomainField", ["%edited%", "", "not a data element"]],
      ["productionDatastreamField", ["%edited%", "", "not a data element"]],
      ["thirdPartyCookiesEnabledField", ["%edited%", "", "not a data element"]],
    ],
  },
  {
    component: "activityCollector",
    instance: {
      ...minimalInstance,
      downloadLinkQualifier: fullInstance.downloadLinkQualifier,
    },
    fields: [
      ["downloadLinkQualifierField", ["%edited%", "", "not a data element"]],
    ],
  },
  {
    component: "streamingMedia",
    instance: {
      ...minimalInstance,
      streamingMedia: fullInstance.streamingMedia,
    },
    fields: [
      ["mediaChannelField", ["%edited%", "", "not a data element"]],
      ["mediaPlayerNameField", ["%edited%", "", "not a data element"]],
      ["mediaMainPingIntervalField", ["25", "", "-1", "61"]],
      ["mediaAdPingIntervalField", ["0"]],
    ],
  },
  {
    component: "pushNotifications",
    instance: {
      ...minimalInstance,
      pushNotifications: fullInstance.pushNotifications,
    },
    fields: [["appIdField", ["%edited%", "", "not a data element"]]],
  },
  {
    component: "brandConcierge",
    instance: { ...minimalInstance, conversation: fullInstance.conversation },
    fields: [
      ["regionField", ["%edited%", "", "bad"]],
      ["streamTimeoutDataTestId", ["25", "", "-1", "9"]],
      ["transferCookie0Field", ["%edited%", "", "not a data element", "   "]],
    ],
  },
  {
    component: "advertising",
    instance: { ...minimalInstance, advertising: fullInstance.advertising },
    fields: [["advertiser0Field", ["%edited%", "", "not a data element"]]],
  },
].flatMap(({ component, instance, fields }) =>
  fields.map(([id, values]) => [
    id,
    values,
    {
      components: {
        ...disabledComponents,
        ...(component && { [component]: true }),
      },
      instances: [instance],
    },
  ]),
);

const DATASTREAMS_URL =
  "https://edge.adobe.io/metadata/namespaces/edge/datasets/datastreams/records/";

const datastream = (id, title, preconfigured, sandboxName = "prod") => ({
  data: {
    title,
    enabled: true,
    settings: {
      com_adobe_analytics: {
        enabled: true,
        reportSuites: ["suite"],
        ...(preconfigured && {
          reportSuites__additional: environments.map((env) => `suite-${env}`),
        }),
      },
      com_adobe_target: {
        enabled: true,
        ...(preconfigured && {
          propertyToken__additional: environments.map((env) => `token-${env}`),
        }),
      },
      ...(preconfigured && {
        com_adobe_identity: {
          idSyncEnabled: true,
          idSyncContainerId: 0,
          idSyncContainerId__additional: [1, 2, 3],
        },
      }),
      com_adobe_experience_platform: {
        enabled: true,
        datasets: {
          event: [
            { datasetId: "dataset", primary: true },
            ...(preconfigured
              ? environments.map((env) => ({
                  datasetId: `dataset-${env}`,
                  primary: false,
                }))
              : []),
          ],
        },
      },
    },
  },
  sandboxName,
  _system: { id },
});

export const configurationHandlers = ({ preconfigured = false } = {}) => [
  http.get(DATASTREAMS_URL, ({ request }) => {
    const sandbox = request.headers.get("x-sandbox-name");
    const records =
      sandbox === "prod"
        ? [
            ["ds-prod", "Production stream"],
            ["ds-staging", "Staging stream"],
            ["ds-development", "Development stream"],
          ].map(([id, title]) => datastream(id, title, preconfigured))
        : [
            datastream(
              "ds-second-sandbox",
              "Second sandbox stream",
              preconfigured,
              sandbox,
            ),
          ];
    return HttpResponse.json({ _embedded: { records }, _links: {} });
  }),
  http.get(
    /^https:\/\/edge\.adobe\.io\/metadata\/namespaces\/edge\/datasets\/datastreams\/records\/[^/]+$/,
    ({ request }) => {
      // Data-element tokens contain literal percent signs, which MSW's named-parameter decoder rejects.
      const id = new URL(request.url).pathname.split("/").at(-1);
      return HttpResponse.json(datastream(id, `${id} stream`, preconfigured));
    },
  ),
  http.get("https://api.tubemogul.com/v1/provisioning/advertisers/", () =>
    HttpResponse.json({
      items: [
        { advertiser_id: "167524", advertiser_name: "Advertiser BF" },
        { advertiser_id: "83565", advertiser_name: "Tubemogul" },
      ],
      paging: { has_more_items: false, total_num_items: 2 },
    }),
  ),
];
