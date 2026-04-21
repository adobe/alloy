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

const DATASTREAMS_ENDPOINT_REGEX = /\/datasets\/datastreams\/records\/(\?|$)/;

export const single = RequestMock()
  .onRequestTo(
    async (request) =>
      DATASTREAMS_ENDPOINT_REGEX.test(request.url) &&
      request.headers["x-sandbox-name"] === "prod" &&
      request.method === "get",
  )
  .respond(
    {
      _embedded: {
        records: [
          {
            data: {
              title: "Test Config Overrides",
              enabled: true,
            },
            orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
            sandboxName: "prod",
            _system: {
              id: "aca8c786-4940-442f-ace5-7c4aba02118e",
              revision: 3,
            },
            _links: {
              self: {
                href: "/metadata/namespaces/edge/datasets/datastreams/records/64c31a3b-d031-4a2f-8834-e96fc15d3030",
                title: "",
              },
            },
          },
        ],
      },
      _links: {
        self: {
          href: "/metadata/namespaces/edge/datasets/datastreams/records?limit=1000&orderby=title",
          title: "",
        },
      },
    },
    200,
    responseHeaders,
  );

export const multiple = RequestMock()
  .onRequestTo(async (request) => {
    return (
      DATASTREAMS_ENDPOINT_REGEX.test(request.url) &&
      request.headers["x-sandbox-name"] === "testsandbox1" &&
      request.method === "get"
    );
  })
  .respond(
    {
      _embedded: {
        records: [
          {
            data: {
              title: "test datastream",
              settings: {
                input: {
                  schemaId: "test schema",
                },
              },
              enabled: true,
            },
            orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
            sandboxName: "prod",
            _system: {
              id: "64c31a3b-d031-4a2f-8834-e96fc15d3030",
              revision: 3,
            },
            _links: {
              self: {
                href: "/metadata/namespaces/edge/datasets/datastreams/records/64c31a3b-d031-4a2f-8834-e96fc15d3030",
                title: "",
              },
            },
          },
          {
            data: {
              title: "test datastream: stage",
              settings: {
                input: {
                  schemaId: "test schema",
                },
              },
              enabled: true,
            },
            orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
            sandboxName: "prod",
            _system: {
              id: "64c31a3b-d031-4a2f-8834-e96fc15d3030:stage",
              revision: 3,
            },
            _links: {
              self: {
                href: "/metadata/namespaces/edge/datasets/datastreams/records/64c31a3b-d031-4a2f-8834-e96fc15d3030",
                title: "",
              },
            },
          },
          {
            data: {
              title: "test datastream: development",
              settings: {
                input: {
                  schemaId: "test schema",
                },
              },
              enabled: true,
            },
            orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
            sandboxName: "prod",
            _system: {
              id: "64c31a3b-d031-4a2f-8834-e96fc15d3030:dev",
              revision: 3,
            },
            _links: {
              self: {
                href: "/metadata/namespaces/edge/datasets/datastreams/records/64c31a3b-d031-4a2f-8834-e96fc15d3030",
                title: "",
              },
            },
          },
        ],
      },
      _links: {
        self: {
          href: "/metadata/namespaces/edge/datasets/datastreams/records?limit=1000&orderby=title",
          title: "",
        },
      },
    },
    200,
    responseHeaders,
  );

export const empty = RequestMock()
  .onRequestTo(async (request) => {
    return (
      DATASTREAMS_ENDPOINT_REGEX.test(request.url) &&
      request.headers["x-sandbox-name"] === "prod" &&
      request.method === "get"
    );
  })
  .respond(
    {
      _embedded: {
        records: [],
      },
      _links: {
        self: {
          href: "/metadata/namespaces/edge/datasets/datastreams/records?limit=1000&orderby=title",
          title: "",
        },
      },
    },
    200,
    responseHeaders,
  );
export const forbidden = RequestMock()
  .onRequestTo(async (request) => {
    return (
      DATASTREAMS_ENDPOINT_REGEX.test(request.url) &&
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
