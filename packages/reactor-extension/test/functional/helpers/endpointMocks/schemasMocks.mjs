/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { RequestMock } from "testcafe";
import responseHeaders from "./responseHeaders.mjs";

const SCHEMAS_ENDPOINT_REGEX = /\/schemaregistry\/tenant\/schemas(\?|$)/;

export const single = RequestMock()
  .onRequestTo({
    url: SCHEMAS_ENDPOINT_REGEX,
    method: "GET",
  })
  .respond(
    {
      results: [
        {
          $id: "https://ns.adobe.com/unifiedjsqeonly/schemas/sch123",
          version: "1.0",
          title: "Test Schema 1",
        },
      ],
      _page: {
        next: null,
      },
    },
    200,
    responseHeaders,
  );

export const multiple = RequestMock()
  .onRequestTo({
    url: SCHEMAS_ENDPOINT_REGEX,
    method: "GET",
  })
  .respond(
    {
      results: [
        {
          $id: "https://ns.adobe.com/unifiedjsqeonly/schemas/sch123",
          version: "1.0",
          title: "Test Schema 1",
        },
        {
          $id: "https://ns.adobe.com/unifiedjsqeonly/schemas/sch124",
          version: "1.0",
          title: "Test Schema 2",
        },
      ],
      _page: {
        next: null,
      },
    },
    200,
    responseHeaders,
  );

export const sandbox2 = RequestMock()
  .onRequestTo(async (request) => {
    return (
      request.url.match(SCHEMAS_ENDPOINT_REGEX) &&
      request.headers["x-sandbox-name"] === "testsandbox2" &&
      request.method === "get"
    );
  })
  .respond(
    {
      results: [
        {
          $id: "https://ns.adobe.com/unifiedjsqeonly/schemas/schema2a",
          version: "1.0",
          title: "Test Schema 2A",
        },
        {
          $id: "https://ns.adobe.com/unifiedjsqeonly/schemas/schema2b",
          version: "1.0",
          title: "Test Schema 2B",
        },
      ],
      _page: {
        next: null,
      },
    },
    200,
    responseHeaders,
  );

export const sandbox3 = RequestMock()
  .onRequestTo(async (request) => {
    return (
      request.url.match(SCHEMAS_ENDPOINT_REGEX) &&
      request.headers["x-sandbox-name"] === "testsandbox3" &&
      request.method === "get"
    );
  })
  .respond(
    {
      results: [
        {
          $id: "https://ns.adobe.com/unifiedjsqeonly/schemas/schema3a",
          version: "1.0",
          title: "Test Schema 3A",
        },
        {
          $id: "https://ns.adobe.com/unifiedjsqeonly/schemas/schema3b",
          version: "1.0",
          title: "Test Schema 3B",
        },
      ],
      _page: {
        next: null,
      },
    },
    200,
    responseHeaders,
  );
export const search = RequestMock()
  .onRequestTo({
    url: /\/schemaregistry\/tenant\/schemas\?.*property=title/,
    method: "GET",
  })
  .respond(
    {
      results: [
        {
          $id: "https://ns.adobe.com/unifiedjsqeonly/schemas/sch125",
          version: "1.0",
          title: "XDM Object Data Element Tests",
        },
      ],
      _page: {
        next: null,
      },
    },
    200,
    responseHeaders,
  );

export const empty = RequestMock()
  .onRequestTo({
    url: SCHEMAS_ENDPOINT_REGEX,
    headers: {
      "x-sandbox-name": "alloy-test",
    },
    method: "GET",
  })
  .respond(
    {
      results: [],
      _page: {
        next: null,
      },
    },
    200,
    responseHeaders,
  );

export const pagingTitles = [
  "Ada",
  "Agnus",
  "Agnese",
  "Alyssa",
  "Amalie",
  "Ardys",
  "Aryn",
  "Arynio",
  "Bettine",
  "Cacilie",
  "Camile",
  "Caritta",
  "Cassondra",
  "Cherrita",
  "Christal",
  "Clarice",
  "Claudina",
  "Clo",
  "Concettina",
  "Corene",
  "Courtnay",
  "Danny",
  "Delilah",
  "Dorice",
  "Drucie",
  "Emma",
  "Emylee",
  "Ethel",
  "Feliza",
  "Fidelia",
  "Flo",
  "Florence",
  "Fredericka",
  "Gertrud",
  "Ginnie",
  "Glynnis",
  "Grier",
  "Gwenneth",
  "Halette",
  "Hallie",
  "Hollie",
  "Janeczka",
  "Jany",
  "Jasmina",
  "Jillayne",
  "Jobi",
  "Joleen",
  "Jordan",
  "Judy",
  "Justina",
  "Justinn",
  "Karina",
  "Karlee",
  "Kathi",
  "Katleen",
  "Kenna",
  "Kial",
  "Kirbee",
  "Lanae",
  "Laticia",
  "Lisette",
  "Lita",
  "Luci",
  "Madalyn",
  "Mady",
  "Mamie",
  "Marcelline",
  "Marguerite",
  "Mariann",
  "Marti",
  "Mary",
  "Miquela",
  "Nanete",
  "Natka",
  "Nikki",
  "Noelle",
  "Olpen",
  "Olwen",
  "Pamella",
  "Paola",
];

export const paging = RequestMock()
  .onRequestTo({
    url: SCHEMAS_ENDPOINT_REGEX,
    method: "GET",
  })
  .respond((req, res) => {
    const PAGE_ITEMS_LIMIT = 30;
    const url = new URL(req.url);
    const start = url.searchParams.get("start");
    // There are multiple "property" query string params. We need the one
    // used for matching the "title" property
    const titleQuery = url.searchParams
      .getAll("property")
      .find((query) => query.startsWith("title"));
    const title = titleQuery ? titleQuery.split("~")[1] : null;
    const filteredTitles = pagingTitles.filter(
      (name) => !title || new RegExp(title).test(name),
    );
    const startIndex = start ? filteredTitles.indexOf(start) : 0;
    const endIndex = Math.min(
      startIndex + PAGE_ITEMS_LIMIT,
      filteredTitles.length,
    );

    res.setBody({
      results: filteredTitles.slice(startIndex, endIndex).map((name) => {
        return {
          $id: `https://ns.adobe.com/unifiedjsqeonly/schemas/${name}`,
          version: "1.0",
          title: name,
        };
      }),
      _page: {
        next:
          endIndex < filteredTitles.length ? filteredTitles[endIndex] : null,
      },
    });
    res.statusCode = 200;
    res.headers = responseHeaders;
  });
