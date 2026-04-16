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

const IDENTITIES_ENDPOINT_REGEX = /\/data\/core\/idnamespace\/identities(\?|$)/;

export const multiple = RequestMock()
  .onRequestTo({ url: IDENTITIES_ENDPOINT_REGEX, method: "GET" })
  .respond(
    [
      {
        updateTime: 1551688425455,
        code: "CORE",
        status: "ACTIVE",
        name: "Audience Manager",
        description: "Adobe Audience Manager UUID",
      },
      {
        updateTime: 1551688425455,
        code: "AAID",
        status: "ACTIVE",
        name: "Adobe Analytics",
        description: "Adobe Analytics (Legacy ID)",
        id: 10,
      },
      {
        updateTime: 1551688425455,
        code: "ECID",
        status: "ACTIVE",
        name: "Experience Cloud",
        description: "Adobe Experience Cloud ID",
        id: 4,
      },
      {
        updateTime: 1551688425455,
        code: "Email",
        status: "ACTIVE",
        name: "Email",
        description: "Email Address",
        id: 6,
      },
      {
        updateTime: 1551688425455,
        code: "WAID",
        status: "ACTIVE",
        name: "Windows AID",
        description: "Windows AID",
        id: 8,
      },
    ],
    200,
    responseHeaders,
  );

export const empty = RequestMock()
  .onRequestTo({ url: IDENTITIES_ENDPOINT_REGEX, method: "GET" })
  .respond([], 200, responseHeaders);

export const error = RequestMock()
  .onRequestTo({ url: IDENTITIES_ENDPOINT_REGEX, method: "GET" })
  .respond({}, 403, responseHeaders);
