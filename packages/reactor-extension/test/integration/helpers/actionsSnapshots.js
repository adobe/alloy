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
import { worker } from "./mocks/browser";

export const extensionSettings = {
  components: Object.fromEntries(
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
  ),
  instances: [
    {
      name: "alloy",
      orgId: "PARITY@AdobeOrg",
      edgeConfigId: "ds-prod",
      sandbox: "prod",
    },
    { name: "secondary", orgId: "SECOND@AdobeOrg", edgeConfigId: "ds-other" },
  ],
};

export const company = { orgId: "PARITY@AdobeOrg" };

export const modes = [
  [
    "components disabled",
    {
      ...extensionSettings,
      components: Object.fromEntries(
        Object.keys(extensionSettings.components).map((name) => [name, false]),
      ),
    },
  ],
];

export const overrides = Object.fromEntries(
  ["development", "staging", "production"].map((env, index) => [
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

const datastream = (id, title) => ({
  data: {
    title,
    enabled: true,
    settings: {
      com_adobe_analytics: { enabled: true, reportSuites: ["suite"] },
      com_adobe_target: { enabled: true },
      com_adobe_experience_platform: {
        enabled: true,
        datasets: { event: [{ datasetId: "dataset", primary: true }] },
      },
    },
  },
  sandboxName: "prod",
  _system: { id },
});

export const mockActionDatastreams = () => {
  worker.use(
    http.get(
      "https://edge.adobe.io/metadata/namespaces/edge/datasets/datastreams/records/",
      () =>
        HttpResponse.json({
          _embedded: {
            records: [
              datastream("ds-prod", "Production stream"),
              datastream("ds-staging", "Staging stream"),
              datastream("ds-development", "Development stream"),
            ],
          },
        }),
    ),
    http.get(
      "https://edge.adobe.io/metadata/namespaces/edge/datasets/datastreams/records/:id",
      ({ params }) =>
        HttpResponse.json(datastream(params.id, `${params.id} stream`)),
    ),
  );
};
