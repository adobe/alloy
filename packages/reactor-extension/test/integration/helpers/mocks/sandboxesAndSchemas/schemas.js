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

const SCHEMAS_URL =
  "https://platform.adobe.io/data/foundation/schemaregistry/tenant/schemas";
const SCHEMA_ID_PREFIX = "https://ns.adobe.com/unifiedjsqeonly/schemas/";

const meta = (id, title) => ({
  $id: `${SCHEMA_ID_PREFIX}${id}`,
  version: "1.0",
  title,
});

const respondWith = (results) =>
  HttpResponse.json({ results, _page: { next: null } });

const hasTitleSearch = (request) =>
  new URL(request.url).searchParams
    .getAll("property")
    .some((property) => property.startsWith("title~"));

const forSandbox = (sandboxName, results) =>
  http.get(SCHEMAS_URL, ({ request }) =>
    request.headers.get("x-sandbox-name") === sandboxName
      ? respondWith(results)
      : undefined,
  );

export const schemasSingleHandlers = [
  http.get(SCHEMAS_URL, () => respondWith([meta("sch123", "Test Schema 1")])),
];

export const schemasMultipleHandlers = [
  http.get(SCHEMAS_URL, () =>
    respondWith([
      meta("sch123", "Test Schema 1"),
      meta("sch124", "Test Schema 2"),
    ]),
  ),
];

export const schemasSandbox2Handlers = [
  forSandbox("testsandbox2", [
    meta("schema2a", "Test Schema 2A"),
    meta("schema2b", "Test Schema 2B"),
  ]),
];

export const schemasSandbox3Handlers = [
  forSandbox("testsandbox3", [
    meta("schema3a", "Test Schema 3A"),
    meta("schema3b", "Test Schema 3B"),
  ]),
];

export const schemasSearchHandlers = [
  http.get(SCHEMAS_URL, ({ request }) =>
    hasTitleSearch(request)
      ? respondWith([meta("sch125", "XDM Object Data Element Tests")])
      : undefined,
  ),
];

const pagingTitles = Array.from(
  { length: 75 },
  (_, i) => `Paging Schema ${String(i + 1).padStart(2, "0")}`,
);
const PAGE_LIMIT = 30;

export const schemasPagingHandlers = [
  http.get(SCHEMAS_URL, ({ request }) => {
    const params = new URL(request.url).searchParams;
    const titleQuery = params
      .getAll("property")
      .find((property) => property.startsWith("title~"));
    const title = titleQuery ? titleQuery.split("~")[1] : null;
    const titles = pagingTitles.filter(
      (name) => !title || new RegExp(title).test(name),
    );
    const start = params.get("start");
    const startIndex = start ? titles.indexOf(start) : 0;
    const endIndex = Math.min(startIndex + PAGE_LIMIT, titles.length);
    return HttpResponse.json({
      results: titles
        .slice(startIndex, endIndex)
        .map((name) => meta(name, name)),
      _page: { next: endIndex < titles.length ? titles[endIndex] : null },
    });
  }),
];

const schemaFields = {
  sch123: [
    "Test Schema 1",
    { testField: { title: "Test Field", type: "string" } },
  ],
  sch125: [
    "XDM Object Data Element Tests",
    { testField: { title: "Test Field", type: "string" } },
  ],
  schema3b: [
    "Test Schema 3B",
    { testField: { title: "Test Field", type: "string" } },
  ],
};

// Resolves a schema by the last segment of its (URL-encoded) id so saved
// settings may reference either the short id or the full $id URL.
export const schemaDetailHandlers = [
  http.get(/\/schemaregistry\/tenant\/schemas\/.+/, ({ request }) => {
    const id = decodeURIComponent(new URL(request.url).pathname)
      .split("/")
      .pop();
    const [title, properties] = schemaFields[id] ?? [];
    if (!title) {
      return HttpResponse.json({ status: 404 }, { status: 404 });
    }
    return HttpResponse.json({
      $id: decodeURIComponent(
        new URL(request.url).pathname.split("/schemas/")[1],
      ),
      title,
      version: "1.0",
      type: "object",
      properties,
    });
  }),
];
