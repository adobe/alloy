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

import { t, Selector } from "testcafe";
import createNetworkLogger from "../../helpers/runtime/createNetworkLogger.mjs";
import addHtmlToBody from "../../helpers/runtime/addHtmlToBody.mjs";
import { TEST_PAGE } from "../../helpers/runtime/constants/url.mjs";
import appendLaunchLibrary from "../../helpers/runtime/appendLaunchLibrary.mjs";

const networkLogger = createNetworkLogger();

const container = {
  extensions: {
    "adobe-alloy": {
      displayName: "Adobe Experience Platform Web SDK",
      settings: {
        instances: [
          {
            name: "alloy",
            edgeConfigId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83:AditiTest",
            thirdPartyCookiesEnabled: false,
          },
        ],
      },
    },
  },
  dataElements: {
    responseBody: {
      settings: {
        path: "responseBody",
      },
      cleanText: false,
      forceLowerCase: false,
      modulePath: "sandbox/javascriptVariable.js",
      storageDuration: "",
    },
  },
  rules: [
    {
      id: "RL1651248059877",
      name: "Apply Response",
      events: [
        {
          modulePath: "sandbox/click.js",
          settings: {},
        },
      ],
      actions: [
        {
          modulePath: "adobe-alloy/dist/lib/actions/applyResponse/index.js",
          settings: {
            instanceName: "alloy",
            responseBody: "%responseBody%",
            renderDecisions: true,
          },
        },
      ],
    },
  ],
  property: {
    name: "Sandbox property",
    settings: {
      id: "PR12345",
      domains: ["adobe.com", "example.com"],
      undefinedVarsReturnEmpty: false,
    },
  },
  company: {
    orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
  },
  environment: {
    id: "EN00000000000000000000000000000000",
    stage: "development",
  },
  buildInfo: {
    turbineVersion: "27.2.1",
    turbineBuildDate: "2022-05-27T22:57:44.929Z",
    buildDate: "2022-05-27T22:57:44.929Z",
    environment: "development",
  },
};

const setupResponseBody = `
  window.responseBody = {
    "requestId": "1483b3db-be86-41a9-8018-1afa88fa0a81",
    "handle": [
        {
            "payload": [
                {
                    "type": "url",
                    "id": 411,
                    "spec": {
                        "url": "//cm.everesttech.net/cm/dd?d_uuid=20053490137561364183742428292452119469",
                        "hideReferrer": false,
                        "ttlMinutes": 10080
                    }
                }
            ],
            "type": "identity:exchange"
        },
        {
            "payload": [
                {
                    "id": "12581525282081748314129365414154872480",
                    "namespace": {
                        "code": "ECID"
                    }
                }
            ],
            "type": "identity:result"
        },
        {
            "payload": [
                {
                    "type": "url",
                    "id": 4072007,
                    "spec": {
                        "url": "https://cataas.com/cat",
                        "hideReferrer": true,
                        "ttlMinutes": 10080
                    }
                },
                {
                    "type": "url",
                    "id": 4292297,
                    "spec": {
                        "url": "https://cataas.com/cat",
                        "hideReferrer": true,
                        "ttlMinutes": 10080
                    }
                }
            ],
            "type": "activation:push",
            "eventIndex": 0
        },
        {
            "payload": [
                {
                    "type": "cookie",
                    "spec": {
                        "name": "C12412",
                        "value": "test=C12412",
                        "domain": "alloyio.com",
                        "ttlDays": 30
                    }
                }
            ],
            "type": "activation:push",
            "eventIndex": 0
        },
        {
            "payload": [
                {
                    "id": "AT:eyJhY3Rpdml0eUlkIjoiMTI3MDIwIiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
                    "scope": "__view__",
                    "scopeDetails": {
                        "decisionProvider": "TGT",
                        "activity": {
                            "id": "127020"
                        },
                        "experience": {
                            "id": "0"
                        },
                        "strategies": [
                            {
                                "algorithmID": "0",
                                "trafficType": "0"
                            }
                        ],
                        "characteristics": {
                            "eventToken": "hrHwTaU9pLCYk0byWkq392qipfsIHvVzTQxHolz2IpTMromRrB5ztP5VMxjHbs7c6qPG9UF4rvQTJZniWgqbOw=="
                        }
                    },
                    "items": [
                        {
                            "id": "0",
                            "schema": "https://ns.adobe.com/personalization/dom-action",
                            "meta": {
                                "experience.id": "0",
                                "activity.id": "127020",
                                "offer.name": "Default Content",
                                "activity.name": "Sandbox: Personalization Page (alloyio.com)",
                                "offer.id": "0"
                            },
                            "data": {
                                "type": "setHtml",
                                "format": "application/vnd.adobe.target.dom-action",
                                "content": "This is personalized content.",
                                "selector": "#personalization-container",
                                "prehidingSelector": "#personalization-container"
                            }
                        }
                    ]
                },
            ],
            "type": "personalization:decisions",
            "eventIndex": 0
        },
        {
            "payload": [
                {
                    "scope": "Target",
                    "hint": "35",
                    "ttlSeconds": 1800
                },
                {
                    "scope": "AAM",
                    "hint": "9",
                    "ttlSeconds": 1800
                },
                {
                    "scope": "EdgeNetwork",
                    "hint": "or2",
                    "ttlSeconds": 1800
                }
            ],
            "type": "locationHint:result"
        },
        {
            "payload": [
                {
                    "key": "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_identity",
                    "value": "CiYxMjU4MTUyNTI4MjA4MTc0ODMxNDEyOTM2NTQxNDE1NDg3MjQ4MFIOCPiK7Li2MBgBKgNPUjKgAfiK7Li2MPAB-IrsuLYw",
                    "maxAge": 34128000,
                    "attrs": {
                        "SameSite": "None"
                    }
                },
                {
                    "key": "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_cluster",
                    "value": "or2",
                    "maxAge": 1800,
                    "attrs": {
                        "SameSite": "None"
                    }
                }
            ],
            "type": "state:store"
        },
        {
            "payload": [
                {
                    "key": "mbox",
                    "value": "session#12581525282081748314129365414154872480-pbJYUO#1665742167",
                    "maxAge": 15552000,
                    "attrs": {
                        "SameSite": "None"
                    }
                },
                {
                    "key": "mboxEdgeCluster",
                    "value": "35",
                    "maxAge": 1800,
                    "attrs": {
                        "SameSite": "None"
                    }
                }
            ],
            "type": "state:store"
        }
    ]
};
`;

fixture("Apply response")
  .page(`${TEST_PAGE}?alloy_debug=true`)
  .requestHooks([networkLogger.edgeEndpointLogs])
  .clientScripts({ content: setupResponseBody });

test("Applies server response", async () => {
  await appendLaunchLibrary(container);
  await addHtmlToBody(
    `<div id="personalization-container">Default Content</div>`,
  );
  // We trigger the applyResponse with a click because if we used pageTop the
  // personalization-container would not be in the DOM.
  await t.click(Selector("#personalization-container"));

  await t
    .expect(Selector("#personalization-container").innerText)
    .eql("This is personalized content.");
});
