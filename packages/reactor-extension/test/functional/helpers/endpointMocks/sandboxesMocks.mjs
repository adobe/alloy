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

const SANDBOXES_ENDPOINT_REGEX = /sandbox-management/;

export const unauthorized = RequestMock()
  .onRequestTo({ url: SANDBOXES_ENDPOINT_REGEX, method: "GET" })
  .respond(
    {
      error_code: "401013",
      message: "Oauth token is not valid",
    },
    401,
    responseHeaders,
  );

export const userRegionMissing = RequestMock()
  .onRequestTo({ url: SANDBOXES_ENDPOINT_REGEX, method: "GET" })
  .respond(
    {
      error_code: "403027",
      message: "User region is missing",
    },
    403,
    responseHeaders,
  );

export const nonJsonBody = RequestMock()
  .onRequestTo({ url: SANDBOXES_ENDPOINT_REGEX, method: "GET" })
  .respond("non-json body", 200, responseHeaders);

export const empty = RequestMock()
  .onRequestTo({ url: SANDBOXES_ENDPOINT_REGEX, method: "GET" })
  .respond(
    {
      sandboxes: [],
    },
    200,
    responseHeaders,
  );

export const singleWithoutDefault = RequestMock()
  .onRequestTo({ url: SANDBOXES_ENDPOINT_REGEX, method: "GET" })
  .respond(
    {
      sandboxes: [
        {
          name: "testsandbox1",
          title: "Test Sandbox 1",
          type: "production",
          isDefault: false,
          region: "VA7",
          state: "active",
        },
      ],
    },
    200,
    responseHeaders,
  );

export const multipleWithDefault = RequestMock()
  .onRequestTo({ url: SANDBOXES_ENDPOINT_REGEX, method: "GET" })
  .respond(
    {
      sandboxes: [
        {
          name: "testsandbox1",
          title: "Test Sandbox 1",
          type: "production",
          isDefault: false,
          region: "VA7",
          state: "active",
        },
        {
          name: "testsandbox2",
          title: "Test Sandbox 2",
          type: "production",
          isDefault: true,
          region: "VA7",
          state: "active",
        },
        {
          name: "testsandbox3",
          title: "Test Sandbox 3",
          type: "production",
          isDefault: false,
          region: "VA7",
          state: "active",
        },
        {
          name: "prod",
          title: "Test Sandbox Prod",
          type: "production",
          isDefault: false,
          region: "VA7",
          state: "active",
        },
      ],
    },
    200,
    responseHeaders,
  );

export const longLasting = RequestMock()
  .onRequestTo({ url: SANDBOXES_ENDPOINT_REGEX, method: "GET" })
  .respond(async (_, res) => {
    await new Promise((r) => {
      setTimeout(r, 10000);
    });

    res.setBody({
      sandboxes: [
        {
          name: "testsandbox1",
          title: "Test Sandbox 1",
          type: "production",
          isDefault: false,
          region: "VA7",
          state: "active",
        },
      ],
    });
  });

export const multipleWithoutDefault = RequestMock()
  .onRequestTo({ url: SANDBOXES_ENDPOINT_REGEX, method: "GET" })
  .respond(
    {
      sandboxes: [
        {
          name: "testsandbox1",
          title: "Test Sandbox 1",
          type: "production",
          isDefault: false,
          region: "VA7",
          state: "active",
        },
        {
          name: "testsandbox2",
          title: "Test Sandbox 2",
          type: "production",
          isDefault: false,
          region: "VA7",
          state: "active",
        },
        {
          name: "testsandbox3",
          title: "Test Sandbox 3",
          type: "production",
          isDefault: false,
          region: "VA7",
          state: "active",
        },
        {
          name: "prod",
          title: "Test Sandbox Prod",
          type: "production",
          isDefault: false,
          region: "VA7",
          state: "active",
        },
      ],
    },
    200,
    responseHeaders,
  );
export const singleDefault = RequestMock()
  .onRequestTo({ url: SANDBOXES_ENDPOINT_REGEX, method: "GET" })
  .respond(
    {
      sandboxes: [
        {
          name: "prod",
          title: "Prod",
          type: "production",
          isDefault: true,
          region: "VA7",
          state: "active",
        },
      ],
    },
    200,
    responseHeaders,
  );
