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

const IDENTITIES_URL =
  "https://platform.adobe.io/data/core/idnamespace/identities";

const namespace = (code, name, description, id) => ({
  updateTime: 1551688425455,
  code,
  status: "ACTIVE",
  name,
  description,
  ...(id && { id }),
});

export const identityNamespacesMultipleHandlers = [
  http.get(IDENTITIES_URL, () =>
    HttpResponse.json([
      namespace("CORE", "Audience Manager", "Adobe Audience Manager UUID"),
      namespace("AAID", "Adobe Analytics", "Adobe Analytics (Legacy ID)", 10),
      namespace("ECID", "Experience Cloud", "Adobe Experience Cloud ID", 4),
      namespace("Email", "Email", "Email Address", 6),
      namespace("WAID", "Windows AID", "Windows AID", 8),
    ]),
  ),
];

export const identityNamespacesEmptyHandlers = [
  http.get(IDENTITIES_URL, () => HttpResponse.json([])),
];

export const identityNamespacesErrorHandlers = [
  http.get(IDENTITIES_URL, () => HttpResponse.json({}, { status: 403 })),
];
