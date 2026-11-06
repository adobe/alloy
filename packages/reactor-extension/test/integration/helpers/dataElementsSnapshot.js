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
import { singleSchemaHandlers } from "./mocks/defaultHandlers";

export const schemaSettings = {
  sandbox: { name: "prod" },
  schema: {
    id: "https://ns.adobe.com/test/schemas/sch123",
    version: "1.0",
  },
};

export const solutions = ["analytics", "audiencemanager", "target"];

const components = Object.fromEntries(
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

export const extensionSettings = {
  components,
  instances: [
    {
      name: "alloy",
      orgId: "PARITY@AdobeOrg",
      edgeConfigId: "ds-prod",
      sandbox: "prod",
      streamingMedia: {
        channel: "Web",
        playerName: "Player",
        appVersion: "1.2",
      },
    },
    {
      name: "secondary",
      orgId: "SECOND@AdobeOrg",
      edgeConfigId: "ds-other",
      streamingMedia: {
        channel: "Other",
        playerName: "Other player",
        appVersion: "2.0",
      },
    },
  ],
};

export const reinitialize = async (driver, settings) => {
  const ready = new Promise((resolve) => {
    window.addEventListener("extension-reactor-alloy:rendered", resolve, {
      once: true,
    });
  });
  await driver.init({ extensionSettings, settings });
  await ready;
};

const schema = {
  $id: schemaSettings.schema.id,
  title: "Test Schema 1",
  version: "1.0",
  type: "object",
  properties: {
    testField: { title: "Test Field", type: "string" },
    count: { title: "Count", type: "integer", minimum: 0 },
    flag: { title: "Flag", type: "boolean" },
    tags: {
      title: "Tags",
      type: "array",
      items: { title: "Tag", type: "string" },
    },
    nested: {
      title: "Nested",
      type: "object",
      properties: { label: { title: "Label", type: "string" } },
    },
  },
};

export const schemaHandlers = [
  ...singleSchemaHandlers,
  http.get(/\/data\/foundation\/schemaregistry\/tenant\/schemas\/.+/, () =>
    HttpResponse.json(schema),
  ),
];

export const xdmData = {
  testField: "%field%",
  count: 3,
  flag: true,
  tags: ["a", "%tag%"],
  nested: { label: "Hello" },
};

export const updateSettings = {
  dataElementName: "XDM variable",
  data: {
    testField: "%value%",
    count: 2,
    flag: true,
    tags: ["a", "b"],
    nested: { label: "nested" },
  },
  customCode: "content.xdm.count = 2;",
};

const dataElements = [
  ["DE1", "XDM variable", schemaSettings],
  ["DE2", "Data variable", { solutions }],
].map(([id, name, settings]) => ({
  id,
  type: "data_elements",
  attributes: {
    name,
    delegate_descriptor_id: "__EXTENSION_NAME__::dataElements::variable",
    settings: JSON.stringify(settings),
  },
}));

export const dataElementHandlers = [
  http.get("https://reactor.adobe.io/properties/PR1234/data_elements", () =>
    HttpResponse.json({
      data: dataElements,
      meta: {
        pagination: {
          current_page: 1,
          next_page: null,
          total_pages: 1,
          total_count: 2,
        },
      },
    }),
  ),
  http.get("https://reactor.adobe.io/data_elements/:id", ({ params }) => {
    const data =
      params.id === "DE_STALE"
        ? { ...dataElements[0], id: "DE_STALE" }
        : dataElements.find(({ id }) => id === params.id);
    return data
      ? HttpResponse.json({ data })
      : HttpResponse.json({ errors: [] }, { status: 404 });
  }),
];

export const selectTreeNode = (view, name) =>
  view
    .getByTestId("xdmTreeNodeTitleDisplayName")
    .getByText(name, { exact: true })
    .click();
