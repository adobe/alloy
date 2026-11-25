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
import {
  analyticsMigrationSchema,
  analyticsMigrationSchemaMeta,
  xdmTestsSchema,
  xdmTestsSchemaMeta,
} from "./schemas";

const schemasById = new Map(
  [xdmTestsSchema, analyticsMigrationSchema].map((schema) => [
    schema.$id,
    schema,
  ]),
);

/**
 * Two schemas ("XDM Object Data Element Tests" and "Analytics Migration") in
 * the default sandbox, so nothing is auto-selected. Schema details are
 * resolved from the id in the request path.
 */
export const richSchemaHandlers = [
  http.get(
    "https://platform.adobe.io/data/foundation/schemaregistry/tenant/schemas",
    () =>
      HttpResponse.json({
        results: [xdmTestsSchemaMeta, analyticsMigrationSchemaMeta],
        _page: { next: null },
      }),
  ),
  http.get(
    /\/data\/foundation\/schemaregistry\/tenant\/schemas\/(.+)/,
    ({ request }) => {
      const id = decodeURIComponent(
        new URL(request.url).pathname.split("/schemas/")[1],
      );
      const schema = schemasById.get(id);
      return schema
        ? HttpResponse.json(schema)
        : HttpResponse.json(
            { title: "Schema does not exist" },
            { status: 404 },
          );
    },
  ),
];

export const xdmTestsSettings = {
  sandbox: { name: "prod" },
  schema: { id: xdmTestsSchemaMeta.$id, version: xdmTestsSchemaMeta.version },
};
