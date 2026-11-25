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

export const XDM_TESTS_SCHEMA_TITLE = "XDM Object Data Element Tests";
export const ANALYTICS_MIGRATION_SCHEMA_TITLE = "Analytics Migration";

export const xdmTestsSchemaMeta = {
  $id: "https://ns.adobe.com/unifiedjsqeonly/schemas/xdmobjecttests",
  version: "1.5",
  title: XDM_TESTS_SCHEMA_TITLE,
};

export const analyticsMigrationSchemaMeta = {
  $id: "https://ns.adobe.com/unifiedjsqeonly/schemas/analyticsmigration",
  version: "1.0",
  title: ANALYTICS_MIGRATION_SCHEMA_TITLE,
};

// The Schema Registry's xed-full format reports properties listed under
// `required` with `isRequired: true` on the property itself, and that flag is
// what the editor validates; so the fixture carries both.
export const xdmTestsSchema = {
  ...xdmTestsSchemaMeta,
  type: "object",
  properties: {
    _id: { title: "Identifier", type: "string" },
    device: {
      title: "Device",
      type: "object",
      properties: {
        colorDepth: {
          title: "Color depth",
          type: "integer",
          description: "The number of colors the display is able to represent.",
        },
      },
    },
    environment: {
      title: "Environment",
      type: "object",
      properties: {
        type: {
          title: "Type",
          type: "string",
          enum: ["browser", "application", "iot", "external", "widget"],
          "meta:enum": {
            browser: "Browser",
            application: "Application",
            iot: "IoT",
            external: "External",
            widget: "Widget",
          },
        },
      },
    },
    placeContext: {
      title: "Place Context",
      type: "object",
      properties: {
        activePOIs: {
          title: "Active POIs",
          type: "array",
          items: {
            title: "POI",
            type: "object",
            properties: {
              geoInteractionDetails: {
                title: "Geo Interaction Details",
                type: "object",
                properties: {
                  geoShape: {
                    title: "Geo Shape",
                    type: "object",
                    properties: {
                      _schema: {
                        title: "Schema",
                        type: "object",
                        properties: {
                          box: {
                            title: "Box",
                            type: "array",
                            items: {
                              title: "Coordinates",
                              type: "object",
                              properties: {
                                _id: {
                                  title: "Coordinates ID",
                                  type: "string",
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    _experience: {
      title: "Experience",
      type: "object",
      properties: {
        decisioning: {
          title: "Decisioning",
          type: "object",
          properties: {
            propositionAction: {
              title: "Proposition Action",
              type: "object",
              properties: {
                label: {
                  type: "string",
                  description: "The label of the proposition action.",
                },
              },
            },
          },
        },
      },
    },
    _unifiedjsqeonly: {
      title: "Unified JS QE Only",
      type: "object",
      properties: {
        vendor: {
          title: "Vendor",
          type: "object",
          properties: {
            name: { title: "Name", type: "string" },
            industries: {
              title: "Industries",
              type: "array",
              items: { title: "Industry", type: "string" },
            },
            numEmployees: { title: "Number of Employees", type: "integer" },
            revenue: { title: "Revenue", type: "number" },
            isLicensed: { title: "Is Licensed", type: "boolean" },
          },
        },
        customer: {
          title: "Customer",
          type: "object",
          required: ["emailAddress"],
          properties: {
            emailAddress: {
              title: "Email Address",
              type: "string",
              isRequired: true,
            },
            mailingAddress: {
              title: "Mailing Address",
              type: "object",
              properties: {
                city: { title: "City", type: "string" },
              },
            },
          },
        },
      },
    },
  },
};

const eVars = Object.fromEntries(
  Array.from({ length: 12 }, (_, i) => [
    `eVar${i + 1}`,
    { title: `eVar${i + 1}`, type: "string" },
  ]),
);

export const analyticsMigrationSchema = {
  ...analyticsMigrationSchemaMeta,
  type: "object",
  properties: {
    _experience: {
      title: "Experience",
      type: "object",
      properties: {
        analytics: {
          title: "Analytics",
          type: "object",
          properties: {
            customDimensions: {
              title: "Custom Dimensions",
              type: "object",
              properties: {
                eVars: {
                  title: "eVars",
                  type: "object",
                  properties: eVars,
                },
              },
            },
          },
        },
      },
    },
  },
};
