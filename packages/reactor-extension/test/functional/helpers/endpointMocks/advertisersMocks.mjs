/*
Copyright 2024 Adobe. All rights reserved.
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

const ADVERTISERS_ENDPOINT_REGEX_PROD =
  /api\.tubemogul\.com\/v1\/provisioning\/advertisers/;
const ADVERTISERS_ENDPOINT_REGEX_STAGING =
  /api-uat\.tubemogul\.com\/v1\/provisioning\/advertisers/;

export const multipleAdvertisers = RequestMock()
  .onRequestTo(
    async (request) =>
      (ADVERTISERS_ENDPOINT_REGEX_PROD.test(request.url) ||
        ADVERTISERS_ENDPOINT_REGEX_STAGING.test(request.url)) &&
      request.method === "get",
  )
  .respond(
    {
      items: [
        {
          advertiser_id: "12345",
          advertiser_name: "Test Advertiser 1",
          enabled: true,
        },
        {
          advertiser_id: "67890",
          advertiser_name: "Test Advertiser 2",
          enabled: true,
        },
        {
          advertiser_id: "11111",
          advertiser_name: "Acme Corporation",
          enabled: false,
        },
      ],
      total: 3,
    },
    200,
    responseHeaders,
  );

export const singleAdvertiser = RequestMock()
  .onRequestTo(
    async (request) =>
      (ADVERTISERS_ENDPOINT_REGEX_PROD.test(request.url) ||
        ADVERTISERS_ENDPOINT_REGEX_STAGING.test(request.url)) &&
      request.method === "get",
  )
  .respond(
    {
      items: [
        {
          advertiser_id: "12345",
          advertiser_name: "Test Advertiser 1",
          enabled: true,
        },
      ],
      total: 1,
    },
    200,
    responseHeaders,
  );

export const noAdvertisers = RequestMock()
  .onRequestTo(
    async (request) =>
      (ADVERTISERS_ENDPOINT_REGEX_PROD.test(request.url) ||
        ADVERTISERS_ENDPOINT_REGEX_STAGING.test(request.url)) &&
      request.method === "get",
  )
  .respond(
    {
      items: [],
      total: 0,
    },
    200,
    responseHeaders,
  );

export const unauthorized = RequestMock()
  .onRequestTo(
    async (request) =>
      (ADVERTISERS_ENDPOINT_REGEX_PROD.test(request.url) ||
        ADVERTISERS_ENDPOINT_REGEX_STAGING.test(request.url)) &&
      request.method === "get",
  )
  .respond(
    {
      error: "Unauthorized",
      message: "Invalid access token",
    },
    401,
    responseHeaders,
  );

export const serverError = RequestMock()
  .onRequestTo(
    async (request) =>
      (ADVERTISERS_ENDPOINT_REGEX_PROD.test(request.url) ||
        ADVERTISERS_ENDPOINT_REGEX_STAGING.test(request.url)) &&
      request.method === "get",
  )
  .respond(
    {
      error: "Internal Server Error",
      message: "Something went wrong",
    },
    500,
    responseHeaders,
  );

export const networkError = RequestMock()
  .onRequestTo(
    async (request) =>
      (ADVERTISERS_ENDPOINT_REGEX_PROD.test(request.url) ||
        ADVERTISERS_ENDPOINT_REGEX_STAGING.test(request.url)) &&
      request.method === "get",
  )
  .respond(null, 503);
