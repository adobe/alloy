/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { http, HttpResponse } from "msw";

export const defaultHandlers = [
  http.get(
    "https://platform.adobe.io/data/foundation/sandbox-management/",
    async () => {
      return HttpResponse.json({
        sandboxes: [
          {
            name: "prod",
            title: "Prod",
            state: "active",
            type: "production",
            region: "VA7",
            isDefault: true,
            eTag: -414156254,
            createdDate: "2020-05-06 00:16:38",
            lastModifiedDate: "2020-08-05 19:58:59",
            createdBy: "system",
            lastModifiedBy: "system",
          },
          {
            name: "number-two-prod",
            title: "Number Two Prod",
            state: "active",
            type: "production",
            region: "VA7",
            isDefault: false,
            eTag: 182967511,
            createdDate: "2021-07-19 21:40:11",
            lastModifiedDate: "2021-07-19 21:40:11",
            createdBy: "65D103374D76880D0A746C19@AdobeID",
            lastModifiedBy: "65D103374D76880D0A746C19@AdobeID",
          },
        ],
        _page: {
          limit: 200,
          count: 2,
        },
        _links: {
          page: {
            href: "https://platform.adobe.io:443/data/foundation/sandbox-management/?limit={limit}&offset={offset}",
            templated: true,
          },
        },
      });
    },
  ),
  http.get(
    "https://edge.adobe.io/metadata/namespaces/edge/datasets/datastreams/records/",
    async () => {
      return HttpResponse.json({
        _embedded: {
          records: [
            {
              data: {
                title: "aep-edge-samples",
                enabled: true,
                settings: {
                  input: {},
                  geo_resolution: "none",
                  state: {
                    first_party_id: {
                      cookie: {
                        enabled: false,
                      },
                    },
                  },
                  com_adobe_identity: {
                    idSyncEnabled: false,
                  },
                  access_type: "mixed",
                  com_adobe_target: {
                    enabled: true,
                    propertyToken: "abf13992-2ba6-fcc7-5d83-885501ed6883",
                  },
                  com_adobe_analytics: {
                    enabled: true,
                    reportSuites: ["ujslujslwaters"],
                  },
                  com_adobe_experience_platform: {
                    enabled: true,
                    datasets: {
                      event: [
                        {
                          datasetId: "5eb4502dd3903818a8d113f5",
                          primary: true,
                          xdmSchema:
                            "https://ns.adobe.com/unifiedjslab/schemas/96bb756ec16fac4d53de2018b2571da61721c7bfc14a3ed6",
                          flowId: "978715b4-972a-49bb-8eed-d90977451956",
                        },
                      ],
                    },
                  },
                  com_adobe_experience_platform_ode: {
                    enabled: false,
                    containerId: "94b98c41-6ec1-34c4-8d60-011c0e376833",
                  },
                  com_adobe_experience_platform_edge_segmentation: {
                    enabled: true,
                  },
                  com_adobe_experience_platform_edge_destinations: {
                    enabled: true,
                  },
                  com_adobe_experience_platform_ajo: {
                    enabled: true,
                    containerId: "94b98c41-6ec1-34c4-8d60-011c0e376833",
                  },
                },
              },
              orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
              sandboxName: "prod",
              _system: {
                id: "0a106b4d-1937-4196-a64d-4a324e972459",
                revision: 10,
                createdAt: "2022-06-15T20:28:15Z",
                createdBy: "exeg_config_service@AdobeID",
                updatedAt: "2024-02-05T17:35:26Z",
                updatedBy: "EE-Gateway-Flow@AdobeID",
              },
              _links: {
                self: {
                  href: "/metadata/namespaces/edge/datasets/datastreams/records/0a106b4d-1937-4196-a64d-4a324e972459",
                },
              },
            },

            {
              data: {
                title: "analytics enabled",
                enabled: true,
                description: "testing activity map",
                settings: {
                  input: {
                    schemaId:
                      "https://ns.adobe.com/unifiedjslab/schemas/95818596c23f70a51ae7e6dddf2a1eb6a203c0f1898cc12c",
                  },
                  geo_resolution: "none",
                  state: {
                    first_party_id: {
                      cookie: {
                        enabled: false,
                      },
                    },
                  },
                  com_adobe_identity: {
                    idSyncEnabled: false,
                  },
                  access_type: "mixed",
                  com_adobe_analytics: {
                    enabled: true,
                    reportSuites: ["ujslatest"],
                  },
                },
              },
              orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
              sandboxName: "prod",
              _system: {
                id: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
                revision: 4,
                createdAt: "2022-10-12T19:10:45Z",
                createdBy: "nciocanu@adobe.com",
                updatedAt: "2022-10-24T10:37:12Z",
                updatedBy: "exeg_config_service@AdobeID",
              },
              _links: {
                self: {
                  href: "/metadata/namespaces/edge/datasets/datastreams/records/2fdb3763-0507-42ea-8856-e91bf3b64faa",
                },
              },
            },

            {
              data: {
                title: "datastream enabled",
                enabled: true,
                description: "to test activity map",
                settings: {
                  input: {
                    schemaId:
                      "https://ns.adobe.com/unifiedjslab/schemas/96bb756ec16fac4d53de2018b2571da61721c7bfc14a3ed6",
                  },
                  geo_resolution: "none",
                  state: {
                    first_party_id: {
                      cookie: {
                        enabled: false,
                      },
                    },
                  },
                  com_adobe_identity: {
                    idSyncEnabled: false,
                  },
                  access_type: "mixed",
                },
              },
              orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
              sandboxName: "prod",
              _system: {
                id: "77469821-5ead-4045-97b6-acfd889ded6b",
                revision: 3,
                createdAt: "2022-10-12T19:10:03Z",
                createdBy: "nciocanu@adobe.com",
                updatedAt: "2022-10-24T13:12:05Z",
                updatedBy: "exeg_config_service@AdobeID",
              },
              _links: {
                self: {
                  href: "/metadata/namespaces/edge/datasets/datastreams/records/77469821-5ead-4045-97b6-acfd889ded6b",
                },
              },
            },
          ],
        },
        _links: {
          self: {
            href: "/metadata/namespaces/edge/datasets/datastreams/records?limit=1000&orderby=title",
          },
        },
      });
    },
  ),

  http.get(
    "https://edge.adobe.io/metadata/namespaces/edge/datasets/datastreams/records/2fdb3763-0507-42ea-8856-e91bf3b64faa",
    async () => {
      return HttpResponse.json({
        data: {
          title: "analytics enabled ",
          enabled: true,
          description: "testing activity map",
          settings: {
            input: {
              schemaId:
                "https://ns.adobe.com/unifiedjslab/schemas/95818596c23f70a51ae7e6dddf2a1eb6a203c0f1898cc12c",
            },
            geo_resolution: "none",
            state: {
              first_party_id: {
                cookie: {
                  enabled: false,
                },
              },
            },
            com_adobe_identity: {
              idSyncEnabled: false,
            },
            access_type: "mixed",
            com_adobe_analytics: {
              enabled: true,
              reportSuites: ["ujslatest"],
            },
          },
        },
        orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
        sandboxName: "prod",
        _system: {
          id: "2fdb3763-0507-42ea-8856-e91bf3b64faa",
          revision: 4,
          createdAt: "2022-10-12T19:10:45Z",
          createdBy: "nciocanu@adobe.com",
          updatedAt: "2022-10-24T10:37:12Z",
          updatedBy: "exeg_config_service@AdobeID",
        },
        _links: {
          self: {
            href: "/metadata/namespaces/edge/datasets/datastreams/records/2fdb3763-0507-42ea-8856-e91bf3b64faa",
          },
        },
      });
    },
  ),

  http.get(
    "https://edge.adobe.io/metadata/namespaces/edge/datasets/datastreams/records/0a106b4d-1937-4196-a64d-4a324e972459",
    async () => {
      return HttpResponse.json({
        data: {
          title: "aep-edge-samples",
          enabled: true,
          settings: {
            input: {},
            geo_resolution: "none",
            state: {
              first_party_id: {
                cookie: {
                  enabled: false,
                },
              },
            },
            com_adobe_identity: {
              idSyncEnabled: false,
            },
            access_type: "mixed",
            com_adobe_target: {
              enabled: true,
              propertyToken: "abf13992-2ba6-fcc7-5d83-885501ed6883",
            },
            com_adobe_analytics: {
              enabled: true,
              reportSuites: ["ujslujslwaters"],
            },
            com_adobe_experience_platform: {
              enabled: true,
              datasets: {
                event: [
                  {
                    datasetId: "5eb4502dd3903818a8d113f5",
                    primary: true,
                    xdmSchema:
                      "https://ns.adobe.com/unifiedjslab/schemas/96bb756ec16fac4d53de2018b2571da61721c7bfc14a3ed6",
                    flowId: "978715b4-972a-49bb-8eed-d90977451956",
                  },
                ],
              },
            },
            com_adobe_experience_platform_ode: {
              enabled: false,
              containerId: "94b98c41-6ec1-34c4-8d60-011c0e376833",
            },
            com_adobe_experience_platform_edge_segmentation: {
              enabled: true,
            },
            com_adobe_experience_platform_edge_destinations: {
              enabled: true,
            },
            com_adobe_experience_platform_ajo: {
              enabled: true,
              containerId: "94b98c41-6ec1-34c4-8d60-011c0e376833",
            },
          },
        },
        orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
        sandboxName: "prod",
        _system: {
          id: "0a106b4d-1937-4196-a64d-4a324e972459",
          revision: 10,
          createdAt: "2022-06-15T20:28:15Z",
          createdBy: "waters@adobe.comexeg_config_service@AdobeID",
          updatedAt: "2024-02-05T17:35:26Z",
          updatedBy: "EE-Gateway-Flow@AdobeID",
        },
        _links: {
          self: {
            href: "/metadata/namespaces/edge/datasets/datastreams/records/0a106b4d-1937-4196-a64d-4a324e972459",
          },
        },
      });
    },
  ),

  http.get(
    "https://edge.adobe.io/metadata/namespaces/edge/datasets/datastreams/records/77469821-5ead-4045-97b6-acfd889ded6b",
    async () => {
      return HttpResponse.json({
        data: {
          title: "datastream enabled",
          enabled: true,
          description: "to test activity map",
          settings: {
            input: {
              schemaId:
                "https://ns.adobe.com/unifiedjslab/schemas/96bb756ec16fac4d53de2018b2571da61721c7bfc14a3ed6",
            },
            geo_resolution: "none",
            state: {
              first_party_id: {
                cookie: {
                  enabled: false,
                },
              },
            },
            com_adobe_identity: {
              idSyncEnabled: false,
            },
            access_type: "mixed",
          },
        },
        orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
        sandboxName: "prod",
        _system: {
          id: "77469821-5ead-4045-97b6-acfd889ded6b",
          revision: 3,
          createdAt: "2022-10-12T19:10:03Z",
          createdBy: "nciocanu@adobe.com",
          updatedAt: "2022-10-24T13:12:05Z",
          updatedBy: "exeg_config_service@AdobeID",
        },
        _links: {
          self: {
            href: "/metadata/namespaces/edge/datasets/datastreams/records/77469821-5ead-4045-97b6-acfd889ded6b",
          },
        },
      });
    },
  ),

  http.get(
    "https://api.tubemogul.com/v1/provisioning/advertisers/",
    async () => {
      return HttpResponse.json({
        "@uri":
          "https://api.tubemogul.com/v1/provisioning/advertisers?sort_by=name&sort_order=asc&ims_org_id=97D1F3F459CE0AD80A495CBE@AdobeOrg&limit=1000&offset=0",
        "@type": "Collection",
        paging: {
          total_num_items: 4,
          limit: 1000,
          offset: 0,
          num_items: 4,
          has_more_items: false,
          sort_by: "name",
        },
        items: [
          {
            "@uri":
              "https://api.tubemogul.com/v1/provisioning/advertisers/167534",
            "@type": "Advertiser",
            account_id: 458435,
            advertiser_id: "167534",
            advertiser_key: "Wu7a4FHhkfEBK8OlkWFq",
            advertiser_name: "<b>test</b>",
            advertiser_url: "http://test.com",
            amo_client: null,
            product_category_id: "163",
            ims_org_id: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
            report_suite_ids: null,
            aam_import_all_segments: "F",
            status: "ACTIVE",
            modified: "2025-07-31 01:46:15.0",
            created: "2022-06-22 10:34:19.0",
            is_adobe_cross_device_enabled: "F",
            byoi_amo_account_id: null,
            aam_setup: null,
          },
          {
            "@uri":
              "https://api.tubemogul.com/v1/provisioning/advertisers/167524",
            "@type": "Advertiser",
            account_id: 458435,
            advertiser_id: "167524",
            advertiser_key: "vhwVf6nZIxnFy4EDWmWB",
            advertiser_name: "Advertiser BF",
            advertiser_url:
              "https://uzxni0mj1sum9dn412ag12so8feb20.bf.gy/advertiser-url",
            amo_client: null,
            product_category_id: "551",
            ims_org_id: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
            report_suite_ids: null,
            aam_import_all_segments: "F",
            status: "ACTIVE",
            modified: "2025-07-31 01:46:31.0",
            created: "2022-06-20 07:24:56.0",
            is_adobe_cross_device_enabled: "F",
            byoi_amo_account_id: null,
            aam_setup: null,
          },
          {
            "@uri":
              "https://api.tubemogul.com/v1/provisioning/advertisers/167536",
            "@type": "Advertiser",
            account_id: 458435,
            advertiser_id: "167536",
            advertiser_key: "CykZRZ4tgydWEedMqLFL",
            advertiser_name: "test",
            advertiser_url: "https://<img src=x onerror=alert('XSS');>",
            amo_client: null,
            product_category_id: "403",
            ims_org_id: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
            report_suite_ids: null,
            aam_import_all_segments: "F",
            status: "ACTIVE",
            modified: "2025-07-31 01:46:46.0",
            created: "2022-06-22 11:04:07.0",
            is_adobe_cross_device_enabled: "F",
            byoi_amo_account_id: null,
            aam_setup: null,
          },
          {
            "@uri":
              "https://api.tubemogul.com/v1/provisioning/advertisers/83565",
            "@type": "Advertiser",
            account_id: 446249,
            advertiser_id: "83565",
            advertiser_key: "o5jfFGbRBqCK39S1aFU6",
            advertiser_name: "Tubemogul",
            advertiser_url: "http://www.kraft.com",
            amo_client: {
              "@uri": "",
              amo_client_id: "22356",
              amo_client_key: "3ROpQayxpPTU5lqu4TEx",
              amo_client_name: "ssc_automation",
              attribution_rule: "last_event",
              attribution_rule_stats_value: "last",
              click_look_back: 60,
              impression_look_back: 14,
              impression_override_weight: 0.0,
              view_thru_weight: 0.4,
              part_of_world: "US",
              timezone_name: "America/Los_Angeles",
              ims_org_id: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
              db_tag: "c31806",
              analytics_conversions_enabled: "F",
              device_graphs: null,
              reportsuite_ids: ["2904766", "300075703"],
              managed: "T",
              ecc_id: "",
              created: "2014-03-10 20:42:48.0",
              modified: "2025-08-13 22:23:15.0",
              jurisdiction: "US",
              byoi_amo_account_id: null,
              display_enabled: "T",
              search_enabled: "T",
            },
            product_category_id: "551",
            ims_org_id: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
            report_suite_ids: ["2904766", "300075703"],
            aam_import_all_segments: "F",
            status: "ACTIVE",
            modified: "2025-08-13 22:23:15.0",
            created: "2014-03-10 20:42:48.0",
            is_adobe_cross_device_enabled: "F",
            byoi_amo_account_id: null,
            aam_setup: null,
          },
        ],
      });
    },
  ),
];

export const noAdvertisersHandlers = [
  http.get(
    "https://api.tubemogul.com/v1/provisioning/advertisers/",
    async () => {
      return HttpResponse.json({
        "@uri":
          "https://api.tubemogul.com/v1/provisioning/advertisers?sort_by=name&sort_order=asc&ims_org_id=97D1F3F459CE0AD80A495CBE@AdobeOrg&limit=1000&offset=0",
        "@type": "Collection",
        paging: {
          total_num_items: 0,
          limit: 1000,
          offset: 0,
          num_items: 0,
          has_more_items: false,
          sort_by: "name",
        },
        items: [],
      });
    },
  ),
];

export const advertisersUnauthorizedHandlers = [
  http.get(
    "https://api.tubemogul.com/v1/provisioning/advertisers/",
    async () => {
      return HttpResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid access token",
        },
        { status: 401 },
      );
    },
  ),
];

export const singleSandboxNoDefaultHandlers = [
  http.get(
    "https://platform.adobe.io/data/foundation/sandbox-management/",
    async () => {
      return HttpResponse.json({
        sandboxes: [
          {
            name: "prod",
            title: "Prod",
            state: "active",
            type: "production",
            region: "VA7",
            isDefault: false,
            eTag: -414156254,
            createdDate: "2020-05-06 00:16:38",
            lastModifiedDate: "2020-08-05 19:58:59",
            createdBy: "system",
            lastModifiedBy: "system",
          },
        ],
        _page: {
          limit: 200,
          count: 1,
        },
        _links: {
          page: {
            href: "https://platform.adobe.io:443/data/foundation/sandbox-management/?limit={limit}&offset={offset}",
            templated: true,
          },
        },
      });
    },
  ),
];

export const sandboxUserRegionMissingHandlers = [
  http.get(
    "https://platform.adobe.io/data/foundation/sandbox-management/",
    async () => {
      return HttpResponse.json({
        error_code: "403027",
        message: "User region is missing",
      });
    },
  ),
];

export const datastreamForbiddenHandlers = [
  http.get(
    "https://edge.adobe.io/metadata/namespaces/edge/datasets/datastreams/records/2fdb3763-0507-42ea-8856-e91bf3b64faa",
    async () => {
      return HttpResponse.json(
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
        { status: 403 },
      );
    },
  ),
];

export const datastreamsForbiddenHandlers = [
  http.get(
    "https://edge.adobe.io/metadata/namespaces/edge/datasets/datastreams/records/",
    async () => {
      return HttpResponse.json(
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
        { status: 403 },
      );
    },
  ),
];

export const sandboxUnauthorizedHandlers = [
  http.get(
    "https://platform.adobe.io/data/foundation/sandbox-management/",
    async () => {
      return HttpResponse.json(
        {
          error_code: "401013",
          message: "Oauth token is not valid",
        },
        { status: 401 },
      );
    },
  ),
];

export const sandboxServerErrorHandlers = [
  http.get(
    "https://platform.adobe.io/data/foundation/sandbox-management/",
    async () => {
      return HttpResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    },
  ),
];

export const sandboxEmptyHandlers = [
  http.get(
    "https://platform.adobe.io/data/foundation/sandbox-management/",
    async () => {
      return HttpResponse.json({
        sandboxes: [],
        _page: { limit: 200, count: 0 },
      });
    },
  ),
];

export const sandboxWithoutProdHandlers = [
  http.get(
    "https://platform.adobe.io/data/foundation/sandbox-management/",
    async () => {
      return HttpResponse.json({
        sandboxes: [
          {
            name: "testsandbox1",
            title: "Test Sandbox 1",
            state: "active",
            type: "production",
            region: "VA7",
            isDefault: false,
          },
          {
            name: "testsandbox2",
            title: "Test Sandbox 2",
            state: "active",
            type: "production",
            region: "VA7",
            isDefault: true,
          },
        ],
        _page: { limit: 200, count: 2 },
      });
    },
  ),
];

export const schemasEmptyHandlers = [
  http.get(
    "https://platform.adobe.io/data/foundation/schemaregistry/tenant/schemas",
    async () => {
      return HttpResponse.json({
        results: [],
        _page: { next: null },
      });
    },
  ),
];

export const schemasServerErrorHandlers = [
  http.get(
    "https://platform.adobe.io/data/foundation/schemaregistry/tenant/schemas",
    async () => {
      return HttpResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    },
  ),
];

export const schemaNotFoundHandlers = [
  http.get(
    /\/data\/foundation\/schemaregistry\/tenant\/schemas\/.+/,
    async () => {
      return HttpResponse.json(
        {
          type: "http://ns.adobe.com/aep/errors/REGISTRY-SCHEMA-DOES-NOT-EXIST",
          title: "Schema does not exist",
          status: 404,
        },
        { status: 404 },
      );
    },
  ),
];

export const singleSchemaHandlers = [
  http.get(
    "https://platform.adobe.io/data/foundation/schemaregistry/tenant/schemas",
    async () => {
      return HttpResponse.json({
        results: [
          {
            $id: "https://ns.adobe.com/test/schemas/sch123",
            version: "1.0",
            title: "Test Schema 1",
          },
        ],
        _page: { next: null },
      });
    },
  ),
];

export const schemaDetailsHandlers = [
  http.get(
    /\/data\/foundation\/schemaregistry\/tenant\/schemas\/.+/,
    async () => {
      return HttpResponse.json({
        $id: "https://ns.adobe.com/test/schemas/sch123",
        title: "Test Schema 1",
        version: "1.0",
        type: "object",
        properties: {
          testField: {
            title: "Test Field",
            type: "string",
          },
        },
      });
    },
  ),
];

export const dataElementsUnauthorizedHandlers = [
  http.get(/\/properties\/.*\/data_elements/, async () => {
    return HttpResponse.json(
      {
        errors: [
          {
            code: "unauthorized",
            detail: "The provided access_token is invalid or expired.",
          },
        ],
      },
      { status: 401 },
    );
  }),
];

export const dataElementsServerErrorHandlers = [
  http.get(/\/properties\/.*\/data_elements/, async () => {
    return HttpResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }),
];

export const dataElementsEmptyHandlers = [
  http.get(/\/properties\/.*\/data_elements/, async () => {
    return HttpResponse.json({
      data: [],
      meta: {
        pagination: {
          current_page: 1,
          next_page: null,
          total_pages: 1,
          total_count: 0,
        },
      },
    });
  }),
];

export const variableDataElementsHandlers = [
  http.get(/\/properties\/.*\/data_elements/, async () => {
    return HttpResponse.json({
      data: [
        {
          id: "DE1",
          attributes: {
            name: "Test XDM Variable",
            delegate_descriptor_id: "adobe-alloy::dataElements::variable",
            settings: JSON.stringify({
              sandbox: { name: "prod" },
              schema: {
                id: "https://ns.adobe.com/test/schemas/sch123",
                version: "1.0",
              },
            }),
          },
        },
      ],
      meta: {
        pagination: {
          current_page: 1,
          next_page: null,
          total_pages: 1,
          total_count: 1,
        },
      },
    });
  }),
];
