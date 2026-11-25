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

const DELEGATE_DESCRIPTOR_ID = "__EXTENSION_NAME__::dataElements::variable";
const DATA_ELEMENTS_URL =
  "https://reactor.adobe.io/properties/PR1234/data_elements";

export const UNIFIED_SCHEMA_ID =
  "https://ns.adobe.com/unifiedjsqeonly/schemas/8f9fc4c28403e4428bbe7b97436322c44a71680349dfd489";

const makeDataElement = (id, name, settings, descriptor) => ({
  id,
  type: "data_elements",
  attributes: {
    name,
    delegate_descriptor_id: descriptor ?? DELEGATE_DESCRIPTOR_ID,
    settings: JSON.stringify(settings),
  },
});

const xdmSettings = (schemaId, version) => ({
  sandbox: { name: "prod" },
  schema: { id: schemaId, version },
});

export const dataElements = {
  other: makeDataElement(
    "ODE1",
    "Other data element 1",
    { value: "aaaa" },
    "core::dataElements::constant",
  ),
  de1: makeDataElement(
    "DE1",
    "Test data variable 1",
    xdmSettings(UNIFIED_SCHEMA_ID, "1.5"),
  ),
  de2: makeDataElement(
    "DE2",
    "Test data variable 2",
    xdmSettings(UNIFIED_SCHEMA_ID, "1.5"),
  ),
  de3: makeDataElement(
    "DE3",
    "Test data variable 3",
    xdmSettings("sch123", "1.0"),
  ),
  de4: makeDataElement(
    "DE4",
    "Test data variable 4",
    xdmSettings("sch456", "1.0"),
  ),
  de5: makeDataElement(
    "DE5",
    "Test data variable 5",
    xdmSettings("sch789", "1.0"),
  ),
  de6: makeDataElement(
    "DE6",
    "Test data variable 6",
    xdmSettings("sch10", "1.0"),
  ),
  sde1: makeDataElement("SDE1", "Test solutions variable 1", {
    solutions: ["analytics", "target", "audiencemanager"],
  }),
  sde2: makeDataElement("SDE2", "Test solutions variable 2", {
    solutions: ["target"],
  }),
};

const objectSchema = ($id, title, properties) => ({
  $id,
  title,
  version: "1.0",
  type: "object",
  properties,
});

const testField = { title: "Test Field", type: "string" };
const otherField = { title: "Other Field", type: "string" };

export const schemas = {
  [UNIFIED_SCHEMA_ID]: {
    $id: UNIFIED_SCHEMA_ID,
    title: "Unified schema",
    version: "1.5",
    type: "object",
    properties: {
      _unifiedjsqeonly: {
        title: "Tenant",
        type: "object",
        properties: {
          vendor: {
            title: "Vendor",
            type: "object",
            properties: { name: { title: "Name", type: "string" } },
          },
        },
      },
    },
  },
  sch123: objectSchema("sch123", "Test Schema 1", { testField }),
  sch456: objectSchema("sch456", "Test Schema 2", { testField, otherField }),
  sch789: {
    $id: "sch789",
    title: "Test Schema 3",
    version: "1.0",
    type: "array",
    items: {
      title: "My Array",
      type: "object",
      properties: { testField },
    },
  },
  sch10: {
    $id: "sch10",
    title: "Test Schema 4",
    version: "1.0",
    type: "array",
    items: {
      title: "My Array",
      type: "object",
      properties: { testField, otherField },
    },
  },
};

const pagination = (current, next) => ({
  pagination: {
    current_page: current,
    next_page: next,
    total_pages: next ? next : current,
    total_count: 0,
  },
});

/**
 * Lists the given data elements (all in one page), honoring the
 * `filter[name]=CONTAINS x` search the combo box sends.
 */
export const dataElementsListHandler = (list) =>
  http.get(DATA_ELEMENTS_URL, ({ request }) => {
    const filter = new URL(request.url).searchParams.get("filter[name]");
    const search = filter?.replace(/^CONTAINS /, "");
    const data = search
      ? list.filter(({ attributes }) => attributes.name.includes(search))
      : list;
    return HttpResponse.json({ data, meta: pagination(1, null) });
  });

/**
 * Serves `pages[n - 1]` for `page[number]=n`, with a next_page cursor for
 * every page but the last.
 */
export const pagedDataElementsHandler = (pages) =>
  http.get(DATA_ELEMENTS_URL, ({ request }) => {
    const page = Number(
      new URL(request.url).searchParams.get("page[number]") ?? 1,
    );
    return HttpResponse.json({
      data: pages[page - 1] ?? [],
      meta: pagination(page, page < pages.length ? page + 1 : null),
    });
  });

/** Serves `/data_elements/:id` for each of the given data elements. */
export const dataElementByIdHandler = (list) =>
  http.get("https://reactor.adobe.io/data_elements/:id", ({ params }) => {
    const data = list.find(({ id }) => id === params.id);
    return data
      ? HttpResponse.json({ data })
      : HttpResponse.json({ errors: [] }, { status: 404 });
  });

/**
 * Serves the schema registry for the given schemas, keyed by id. Any other
 * schema id responds 404, so a data element can have an unreadable schema.
 */
export const schemaDetailsHandler = (schemaMap) =>
  http.get(
    /\/data\/foundation\/schemaregistry\/tenant\/schemas\/(.+)/,
    ({ request }) => {
      const id = decodeURIComponent(
        new URL(request.url).pathname.split("/schemas/")[1],
      );
      return schemaMap[id]
        ? HttpResponse.json(schemaMap[id])
        : HttpResponse.json(
            { title: "Schema does not exist" },
            { status: 404 },
          );
    },
  );

const pick = (map, keys) => keys.map((key) => map[key]);

/**
 * Handlers for the common case: the listed data elements (by key of
 * `dataElements`) are available and every schema in `schemas` is readable
 * except those named in `unreadableSchemas`. `listHandler` replaces the
 * data element list handler (e.g. with `pagedDataElementsHandler`).
 */
export const updateVariableHandlers = (
  keys,
  { unreadableSchemas = [], listHandler } = {},
) => {
  const list = pick(dataElements, keys);
  const readable = Object.fromEntries(
    Object.entries(schemas).filter(([id]) => !unreadableSchemas.includes(id)),
  );
  return [
    listHandler ?? dataElementsListHandler(list),
    dataElementByIdHandler(Object.values(dataElements)),
    schemaDetailsHandler(readable),
  ];
};
