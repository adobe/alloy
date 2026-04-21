/*
Copyright 2022 Adobe. All rights reserved.
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

const DATASTREAM_ENDPOINT_REGEX = /\/edge\/datasets\/datastreams\/records\/.+/;
const specificDatastream =
  /\/edge\/datasets\/datastreams\/records\/64c31a3b-d031-4a2f-8834-e96fc15d3030/;
const configOverridesDatastream =
  /\/edge\/datasets\/datastreams\/records\/aca8c786-4940-442f-ace5-7c4aba02118e/;

export const basic = RequestMock()
  .onRequestTo(async (request) => {
    return (
      specificDatastream.test(request.url) &&
      request.headers["x-sandbox-name"] === "testsandbox1" &&
      request.method === "get"
    );
  })
  .respond(
    {
      data: {
        title: "test datastream",
      },
      orgId: "test@AdobeOrg",
      sandboxName: "testsandbox1",
      _system: {
        id: "64c31a3b-d031-4a2f-8834-e96fc15d3030",
      },
    },
    200,
    responseHeaders,
  );

export const withConfigOverrides = RequestMock()
  .onRequestTo({ method: "get", url: configOverridesDatastream })
  .respond(
    {
      data: {
        title: "Test Config Overrides",
        enabled: true,
        settings: {
          input: {},
          com_adobe_experience_platform: {
            enabled: true,
            datasets: {
              event: [
                {
                  datasetId: "6335dd690894431c07237f2d",
                  primary: true,
                  xdmSchema:
                    "https://ns.adobe.com/unifiedjsqeonly/schemas/c5d1823f0f13c7f52d1ae0a5e29157616835710bc7dcf68b",
                  flowId: "2d981e74-0f5a-470a-a01b-3a291a4f72c7",
                },
                {
                  datasetId: "6335faf30f5a161c0b4b1444",
                  primary: false,
                  xdmSchema:
                    "https://ns.adobe.com/unifiedjsqeonly/schemas/c5d1823f0f13c7f52d1ae0a5e29157616835710bc7dcf68b",
                  flowId: "cd49b412-3923-4b72-afc5-c92d585bed8e",
                },
              ],
            },
            com_adobe_edge_ode: {
              enabled: true,
            },
            com_adobe_edge_segmentation: {
              enabled: true,
            },
            com_adobe_edge_destinations: {
              enabled: true,
            },
            com_adobe_edge_ajo: {
              enabled: true,
            },
          },
          com_adobe_analytics: {
            enabled: true,
            reportSuites: [
              "unifiedjsqeonly2",
              "unifiedjsqeonlylatest",
              "unifiedjsqeonlymobileweb",
            ],
          },
          com_adobe_target: {
            enabled: true,
            propertyToken: "a15d008c-5ec0-cabd-7fc7-ab54d56f01e8",
            propertyToken__additional: [
              "aba5431a-9f59-f816-7d73-8e40c8f4c4fd",
              "65d186ff-be14-dfa0-75fa-546d93bebf91",
            ],
          },
          com_adobe_identity: {
            idSyncEnabled: true,
            idSyncContainerId: 105012,
            idSyncContainerId__additional: [107756, 107757],
          },
          com_adobe_audiencemanager: {
            enabled: true,
          },
          com_adobe_launch_ssf: {
            enabled: true,
          },
        },
      },
      orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
      sandboxName: "prod",
      _system: {
        id: "aca8c786-4940-442f-ace5-7c4aba02118e",
      },
    },
    200,
    responseHeaders,
  );

export const withConfigOverridesAndDisabledServices = RequestMock()
  .onRequestTo({ method: "get", url: configOverridesDatastream })
  .respond(
    {
      data: {
        title: "Test Config Overrides",
        enabled: true,
        settings: {
          input: {},
          com_adobe_experience_platform: {
            enabled: false,
          },
          com_adobe_analytics: {
            enabled: false,
          },
          com_adobe_target: {
            enabled: false,
          },
          com_adobe_identity: {
            idSyncEnabled: true,
            idSyncContainerId: 105012,
            idSyncContainerId__additional: [107756, 107757],
          },
          com_adobe_audiencemanager: {
            enabled: false,
          },
          com_adobe_launch_ssf: {
            enabled: false,
          },
        },
      },
      orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
      sandboxName: "prod",
      _system: {
        id: "aca8c786-4940-442f-ace5-7c4aba02118e",
      },
    },
    200,
    responseHeaders,
  );

export const withConfigOverridesAndAbsentServices = RequestMock()
  .onRequestTo({ method: "get", url: configOverridesDatastream })
  .respond(
    {
      data: {
        title: "Test Config Overrides",
        enabled: true,
        settings: {
          input: {},
          com_adobe_experience_platform: {
            enabled: true,
          },
        },
      },
      orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
      sandboxName: "prod",
      _system: {
        id: "aca8c786-4940-442f-ace5-7c4aba02118e",
      },
    },
    200,
    responseHeaders,
  );

export const notExist = RequestMock()
  .onRequestTo(async (request) => {
    return (
      specificDatastream.test(request.url) &&
      request.headers["x-sandbox-name"] === "testsandbox2" &&
      request.method === "get"
    );
  })
  .respond({}, 404, responseHeaders);

export const unauthorized = RequestMock()
  .onRequestTo({ url: DATASTREAM_ENDPOINT_REGEX, method: "GET" })
  .respond(
    {
      error_code: "401013",
      message: "Oauth token is not valid",
    },
    401,
    responseHeaders,
  );

export const forbidden = RequestMock()
  .onRequestTo(async (request) => {
    return (
      specificDatastream.test(request.url) &&
      request.headers["x-sandbox-name"] === "testsandbox2" &&
      request.method === "get"
    );
  })
  .respond(
    {
      type: "https://ns.adobe.com/aep/errors/EXEG-3050-403",
      status: 403,
      title: "Forbidden",
      detail: "Access is denied",
      report: {
        timestamp: "2022-10-20T12:31:11Z",
        version: "1.3.13",
        requestId: "1yMgl3lAhfaBzteXQiBPqymbbEhSNFQ5",
        orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
      },
    },
    403,
    responseHeaders,
  );
