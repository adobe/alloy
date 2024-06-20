/* eslint-disable */
import React, { useEffect, useState } from "react";
import ContentSecurityPolicy from "../ContentSecurityPolicy";
import "./ContentCards.css";
import { deleteAllCookies, getAlloyTestConfigs } from "../utils";

const configKey = localStorage.getItem("iam-configKey") || "stage";
let responseSource = localStorage.getItem("iam-responseSource") || "mock";

const config = getAlloyTestConfigs();

const { datastreamId, orgId, decisionContext, edgeDomain, alloyInstance } =
  config[configKey];

if (alloyInstance !== window.alloy) {
  alloyInstance("configure", {
    defaultConsent: "in",
    datastreamId,
    orgId,
    edgeDomain,
    thirdPartyCookiesEnabled: false,
    targetMigrationEnabled: false,
    personalizationStorageEnabled: true,
    debugEnabled: true,
  });
}

const surface = "web://aepdemo.com/contentCards";

const mockResponse = {
  requestId: "5a38a9ef-67d7-4f66-8977-c4dc0e0967b6",
  handle: [
    {
      payload: [
        {
          id: "11893040138696185741718511332124641876",
          namespace: {
            code: "ECID",
          },
        },
      ],
      type: "identity:result",
    },
    {
      payload: [
        {
          scopeDetails: {
            decisionProvider: "AJO",
            characteristics: {
              eventToken:
                "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6Ik5BIiwibWVzc2FnZUlEIjoiMDJjNzdlYTgtN2MwZS00ZDMzLTgwOTAtNGE1YmZkM2Q3NTAzIiwibWVzc2FnZVR5cGUiOiJtYXJrZXRpbmciLCJjYW1wYWlnbklEIjoiMzlhZThkNGItYjU1ZS00M2RjLWExNDMtNzdmNTAxOTViNDg3IiwiY2FtcGFpZ25WZXJzaW9uSUQiOiJiZDg1ZDllOC0yMDM3LTQyMmYtYjZkMi0zOTU3YzkwNTU5ZDMiLCJjYW1wYWlnbkFjdGlvbklEIjoiYjQ3ZmRlOGItNTdjMS00YmJlLWFlMjItNjRkNWI3ODJkMTgzIiwibWVzc2FnZVB1YmxpY2F0aW9uSUQiOiJhZTUyY2VkOC0yMDBjLTQ5N2UtODc4Ny1lZjljZmMxNzgyMTUifSwibWVzc2FnZVByb2ZpbGUiOnsiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvd2ViIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy93ZWIifSwibWVzc2FnZVByb2ZpbGVJRCI6ImY1Y2Q5OTk1LTZiNDQtNDIyMS05YWI3LTViNTMzOGQ1ZjE5MyJ9fQ==",
            },
            strategies: [
              {
                strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
                treatmentID: "yu7rkogezumca7i0i44v",
              },
            ],
            activity: {
              id: "8e24e51d-5203-4d0b-99c9-2b3c95ff48f2#05885219-ea84-43bc-874e-1ef4a85b6fbb",
            },
            correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503",
          },
          id: "1a3d874f-39ee-4310-bfa9-6559a10041a4",
          items: [
            {
              id: "9d9c6e62-a8e5-419b-abe3-429950c27425",
              schema: "https://ns.adobe.com/personalization/ruleset-item",
              data: {
                version: 1,
                rules: [
                  {
                    condition: {
                      definition: {
                        conditions: [
                          {
                            definition: {
                              events: [
                                {
                                  "iam.eventType": "dismiss",
                                  "iam.id":
                                    "8e24e51d-5203-4d0b-99c9-2b3c95ff48f2#05885219-ea84-43bc-874e-1ef4a85b6fbb",
                                },
                              ],
                              matcher: "le",
                              value: 0,
                            },
                            type: "historical",
                          },
                          {
                            definition: {
                              conditions: [
                                {
                                  definition: {
                                    key: "events",
                                    matcher: "ex",
                                  },
                                  type: "matcher",
                                },
                                {
                                  definition: {
                                    events: [
                                      {
                                        "iam.eventType": "trigger",
                                        "iam.id":
                                          "8e24e51d-5203-4d0b-99c9-2b3c95ff48f2#05885219-ea84-43bc-874e-1ef4a85b6fbb",
                                      },
                                    ],
                                    matcher: "ge",
                                    value: 1,
                                  },
                                  type: "historical",
                                },
                              ],
                              logic: "or",
                            },
                            type: "group",
                          },
                        ],
                        logic: "and",
                      },
                      type: "group",
                    },
                    consequences: [
                      {
                        type: "schema",
                        detail: {
                          schema:
                            "https://ns.adobe.com/personalization/message/content-card",
                          data: {
                            expiryDate: 1712190456,
                            publishedDate: 1677752640000,
                            meta: {
                              surface,
                            },
                            content: {
                              imageUrl: "/img/lumon.png",
                              actionTitle: "Shop the sale!",
                              actionUrl: "https://luma.com/sale",
                              body: "a handshake is available upon request.",
                              title: "Welcome to Lumon!",
                            },
                            contentType: "application/json",
                          },
                          id: "a48ca420-faea-467e-989a-5d179d9f562d",
                        },
                        id: "a48ca420-faea-467e-989a-5d179d9f562d",
                      },
                    ],
                  },
                ],
              },
            },
          ],
          scope: surface,
        },
        {
          scopeDetails: {
            decisionProvider: "AJO",
            characteristics: {
              eventToken:
                "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6Ik5BIiwibWVzc2FnZUlEIjoiMDJjNzdlYTgtN2MwZS00ZDMzLTgwOTAtNGE1YmZkM2Q3NTAzIiwibWVzc2FnZVR5cGUiOiJtYXJrZXRpbmciLCJjYW1wYWlnbklEIjoiMzlhZThkNGItYjU1ZS00M2RjLWExNDMtNzdmNTAxOTViNDg3IiwiY2FtcGFpZ25WZXJzaW9uSUQiOiJiZDg1ZDllOC0yMDM3LTQyMmYtYjZkMi0zOTU3YzkwNTU5ZDMiLCJjYW1wYWlnbkFjdGlvbklEIjoiYjQ3ZmRlOGItNTdjMS00YmJlLWFlMjItNjRkNWI3ODJkMTgzIiwibWVzc2FnZVB1YmxpY2F0aW9uSUQiOiJhZTUyY2VkOC0yMDBjLTQ5N2UtODc4Ny1lZjljZmMxNzgyMTUifSwibWVzc2FnZVByb2ZpbGUiOnsiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvd2ViIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy93ZWIifSwibWVzc2FnZVByb2ZpbGVJRCI6ImY1Y2Q5OTk1LTZiNDQtNDIyMS05YWI3LTViNTMzOGQ1ZjE5MyJ9fQ==",
            },
            strategies: [
              {
                strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
                treatmentID: "yu7rkogezumca7i0i44v",
              },
            ],
            activity: {
              id: "9d8d3896-872f-4fab-8440-220c7f012ba8#b1e22d27-40cb-42ba-aa1f-9a6d26a737a6",
            },
            correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503",
          },
          id: "532a0ac7-7412-42e1-b2c3-62fb0d0e5db0",
          items: [
            {
              id: "97b69bf2-dc9c-43d4-8a39-4c9def816cf2",
              schema: "https://ns.adobe.com/personalization/ruleset-item",
              data: {
                version: 1,
                rules: [
                  {
                    condition: {
                      definition: {
                        conditions: [
                          {
                            definition: {
                              events: [
                                {
                                  "iam.eventType": "dismiss",
                                  "iam.id":
                                    "9d8d3896-872f-4fab-8440-220c7f012ba8#b1e22d27-40cb-42ba-aa1f-9a6d26a737a6",
                                },
                              ],
                              matcher: "le",
                              value: 0,
                            },
                            type: "historical",
                          },
                          {
                            definition: {
                              conditions: [
                                {
                                  definition: {
                                    key: "events",
                                    matcher: "ex",
                                  },
                                  type: "matcher",
                                },
                                {
                                  definition: {
                                    events: [
                                      {
                                        "iam.eventType": "trigger",
                                        "iam.id":
                                          "9d8d3896-872f-4fab-8440-220c7f012ba8#b1e22d27-40cb-42ba-aa1f-9a6d26a737a6",
                                      },
                                    ],
                                    matcher: "ge",
                                    value: 1,
                                  },
                                  type: "historical",
                                },
                              ],
                              logic: "or",
                            },
                            type: "group",
                          },
                        ],
                        logic: "and",
                      },
                      type: "group",
                    },
                    consequences: [
                      {
                        type: "schema",
                        detail: {
                          schema:
                            "https://ns.adobe.com/personalization/message/content-card",
                          data: {
                            expiryDate: 1712190456,
                            publishedDate: 1677839040000,
                            meta: {
                              surface,
                            },
                            content: {
                              imageUrl: "/img/achievement.jpg",
                              actionTitle: "Shop the sale!",
                              actionUrl: "https://luma.com/sale",
                              body: "Great job, you completed your profile.",
                              title: "Achievement Unlocked!",
                            },
                            contentType: "application/json",
                          },
                          id: "b7173290-588f-40c6-a05c-43ed5ec08b28",
                        },
                        id: "b7173290-588f-40c6-a05c-43ed5ec08b28",
                      },
                    ],
                  },
                ],
              },
            },
          ],
          scope: surface,
        },
        {
          scopeDetails: {
            decisionProvider: "AJO",
            characteristics: {
              eventToken:
                "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6Ik5BIiwibWVzc2FnZUlEIjoiMDJjNzdlYTgtN2MwZS00ZDMzLTgwOTAtNGE1YmZkM2Q3NTAzIiwibWVzc2FnZVR5cGUiOiJtYXJrZXRpbmciLCJjYW1wYWlnbklEIjoiMzlhZThkNGItYjU1ZS00M2RjLWExNDMtNzdmNTAxOTViNDg3IiwiY2FtcGFpZ25WZXJzaW9uSUQiOiJiZDg1ZDllOC0yMDM3LTQyMmYtYjZkMi0zOTU3YzkwNTU5ZDMiLCJjYW1wYWlnbkFjdGlvbklEIjoiYjQ3ZmRlOGItNTdjMS00YmJlLWFlMjItNjRkNWI3ODJkMTgzIiwibWVzc2FnZVB1YmxpY2F0aW9uSUQiOiJhZTUyY2VkOC0yMDBjLTQ5N2UtODc4Ny1lZjljZmMxNzgyMTUifSwibWVzc2FnZVByb2ZpbGUiOnsiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvd2ViIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy93ZWIifSwibWVzc2FnZVByb2ZpbGVJRCI6ImY1Y2Q5OTk1LTZiNDQtNDIyMS05YWI3LTViNTMzOGQ1ZjE5MyJ9fQ==",
            },
            strategies: [
              {
                strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
                treatmentID: "yu7rkogezumca7i0i44v",
              },
            ],
            activity: {
              id: "cf087a6e-131d-4147-adc7-bc1ea947f09c#ff64e6e6-e43f-479d-b5c0-f5568c771b3b",
            },
            correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503",
          },
          id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
          items: [
            {
              id: "e0575812-74e5-46b9-a4f2-9541dfaec2d0",
              schema: "https://ns.adobe.com/personalization/ruleset-item",
              data: {
                version: 1,
                rules: [
                  {
                    condition: {
                      definition: {
                        conditions: [
                          {
                            definition: {
                              events: [
                                {
                                  "iam.eventType": "dismiss",
                                  "iam.id":
                                    "cf087a6e-131d-4147-adc7-bc1ea947f09c#ff64e6e6-e43f-479d-b5c0-f5568c771b3b",
                                },
                              ],
                              matcher: "le",
                              value: 0,
                            },
                            type: "historical",
                          },
                          {
                            definition: {
                              conditions: [
                                {
                                  definition: {
                                    key: "action",
                                    matcher: "eq",
                                    values: ["share-social-media"],
                                  },
                                  type: "matcher",
                                },
                                {
                                  definition: {
                                    events: [
                                      {
                                        "iam.eventType": "trigger",
                                        "iam.id":
                                          "cf087a6e-131d-4147-adc7-bc1ea947f09c#ff64e6e6-e43f-479d-b5c0-f5568c771b3b",
                                      },
                                    ],
                                    matcher: "ge",
                                    value: 1,
                                  },
                                  type: "historical",
                                },
                              ],
                              logic: "or",
                            },
                            type: "group",
                          },
                        ],
                        logic: "and",
                      },
                      type: "group",
                    },
                    consequences: [
                      {
                        type: "schema",
                        detail: {
                          schema:
                            "https://ns.adobe.com/personalization/message/content-card",
                          data: {
                            expiryDate: 1712190456,
                            publishedDate: 1678098240000,
                            meta: {
                              surface,
                            },
                            content: {
                              imageUrl: "/img/twitter.png",
                              actionTitle: "Shop the sale!",
                              actionUrl: "https://luma.com/sale",
                              body: "Posting on social media helps us spread the word.",
                              title: "Thanks for sharing!",
                            },
                            contentType: "application/json",
                          },
                          id: "cfcb1af7-7bc2-45b2-a86a-0aa93fe69ce7",
                        },
                        id: "cfcb1af7-7bc2-45b2-a86a-0aa93fe69ce7",
                      },
                    ],
                  },
                ],
              },
            },
          ],
          scope: surface,
        },
        {
          scopeDetails: {
            decisionProvider: "AJO",
            characteristics: {
              eventToken:
                "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6Ik5BIiwibWVzc2FnZUlEIjoiMDJjNzdlYTgtN2MwZS00ZDMzLTgwOTAtNGE1YmZkM2Q3NTAzIiwibWVzc2FnZVR5cGUiOiJtYXJrZXRpbmciLCJjYW1wYWlnbklEIjoiMzlhZThkNGItYjU1ZS00M2RjLWExNDMtNzdmNTAxOTViNDg3IiwiY2FtcGFpZ25WZXJzaW9uSUQiOiJiZDg1ZDllOC0yMDM3LTQyMmYtYjZkMi0zOTU3YzkwNTU5ZDMiLCJjYW1wYWlnbkFjdGlvbklEIjoiYjQ3ZmRlOGItNTdjMS00YmJlLWFlMjItNjRkNWI3ODJkMTgzIiwibWVzc2FnZVB1YmxpY2F0aW9uSUQiOiJhZTUyY2VkOC0yMDBjLTQ5N2UtODc4Ny1lZjljZmMxNzgyMTUifSwibWVzc2FnZVByb2ZpbGUiOnsiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvd2ViIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy93ZWIifSwibWVzc2FnZVByb2ZpbGVJRCI6ImY1Y2Q5OTk1LTZiNDQtNDIyMS05YWI3LTViNTMzOGQ1ZjE5MyJ9fQ==",
            },
            strategies: [
              {
                strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
                treatmentID: "yu7rkogezumca7i0i44v",
              },
            ],
            activity: {
              id: "57712381-1690-4d19-9469-0a35ea5bd4e3#74f8e5cf-d770-41c3-b595-557b3ee00ba3",
            },
            correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503",
          },
          id: "d1f7d411-a549-47bc-a4d8-c8e638b0a46b",
          items: [
            {
              id: "f47638a0-b785-4f56-afa6-c24e714b8ff4",
              schema: "https://ns.adobe.com/personalization/ruleset-item",
              data: {
                version: 1,
                rules: [
                  {
                    condition: {
                      definition: {
                        conditions: [
                          {
                            definition: {
                              events: [
                                {
                                  "iam.eventType": "dismiss",
                                  "iam.id":
                                    "57712381-1690-4d19-9469-0a35ea5bd4e3#74f8e5cf-d770-41c3-b595-557b3ee00ba3",
                                },
                              ],
                              matcher: "le",
                              value: 0,
                            },
                            type: "historical",
                          },
                          {
                            definition: {
                              conditions: [
                                {
                                  definition: {
                                    key: "action",
                                    matcher: "eq",
                                    values: ["deposit-funds"],
                                  },
                                  type: "matcher",
                                },
                                {
                                  definition: {
                                    events: [
                                      {
                                        "iam.eventType": "trigger",
                                        "iam.id":
                                          "57712381-1690-4d19-9469-0a35ea5bd4e3#74f8e5cf-d770-41c3-b595-557b3ee00ba3",
                                      },
                                    ],
                                    matcher: "ge",
                                    value: 1,
                                  },
                                  type: "historical",
                                },
                              ],
                              logic: "or",
                            },
                            type: "group",
                          },
                        ],
                        logic: "and",
                      },
                      type: "group",
                    },
                    consequences: [
                      {
                        type: "schema",
                        detail: {
                          schema:
                            "https://ns.adobe.com/personalization/message/content-card",
                          data: {
                            expiryDate: 1712190456,
                            publishedDate: 1678184640000,
                            meta: {
                              surface,
                            },
                            content: {
                              imageUrl: "/img/gold-coin.jpg",
                              actionTitle: "Shop the sale!",
                              actionUrl: "https://luma.com/sale",
                              body: "Now you're ready to earn!",
                              title: "Funds deposited!",
                            },
                            contentType: "application/json",
                          },
                          id: "0263e171-fa32-4c7a-9611-36b28137a81d",
                        },
                        id: "0263e171-fa32-4c7a-9611-36b28137a81d",
                      },
                    ],
                  },
                ],
              },
            },
          ],
          scope: surface,
        },
      ],
      type: "personalization:decisions",
      eventIndex: 0,
    },
    {
      payload: [
        {
          scope: "Target",
          hint: "35",
          ttlSeconds: 1800,
        },
        {
          scope: "AAM",
          hint: "9",
          ttlSeconds: 1800,
        },
        {
          scope: "EdgeNetwork",
          hint: "or2",
          ttlSeconds: 1800,
        },
      ],
      type: "locationHint:result",
    },
    {
      payload: [
        {
          key: "kndctr_4DA0571C5FDC4BF70A495FC2_AdobeOrg_cluster",
          value: "or2",
          maxAge: 1800,
          attrs: {
            SameSite: "None",
          },
        },
      ],
      type: "state:store",
    },
  ],
};

const prettyDate = (value) => {
  let output = "";

  if (typeof value !== "undefined") {
    const now = new Date().getTime();
    const seconds = Math.floor(now / 1000);
    const oldTimestamp = Math.floor(value / 1000);
    const difference = seconds - oldTimestamp;

    if (difference < 60) {
      output = `${difference} second(s) ago`;
    } else if (difference < 3600) {
      output = `${Math.floor(difference / 60)} min ago`;
    } else if (difference < 86400) {
      output = `${Math.floor(difference / 3600)} hour(s) ago`;
    } else if (difference < 2620800) {
      output = `${Math.floor(difference / 86400)} day(s) ago`;
    } else if (difference < 31449600) {
      output = `${Math.floor(difference / 2620800)} month(s) ago`;
    } else {
      output = `${Math.floor(difference / 31449600)} year(s) ago`;
    }
  }

  return output;
};

export default function ContentCards() {
  const [clickHandler, setClickHandler] = useState(() => () => {});
  const [dismissHandler, setDismissHandler] = useState(() => () => {});

  const [contentCards, setContentCards] = useState([]);

  useEffect(() => {
    const startupPromises = Promise.all([
      alloyInstance("subscribeRulesetItems", {
        surfaces: [surface],
        callback: (result) => {
          console.log("subscribeRulesetItems", result);
        },
      }),
      alloyInstance("subscribeContentCards", {
        surface,
        callback: ({ items = [], rendered, clicked, dismissed }) => {
          console.log("subscribeContentCards", items);
          setClickHandler(() => clicked);
          setDismissHandler(() => dismissed);
          setContentCards(items);
          rendered(items);
        },
      }),
      responseSource === "edge"
        ? alloyInstance("sendEvent", {
            renderDecisions: true,
            type: "decisioning.propositionFetch",
            personalization: {
              surfaces: [surface],
              decisionContext: { ...decisionContext },
              sendDisplayEvent: false,
            },
          })
        : alloyInstance("applyResponse", {
            renderDecisions: true,
            responseBody: mockResponse,
          }),
    ]);

    return () => {
      startupPromises.then(([rulesetItems, contentCards]) => {
        contentCards.unsubscribe();
        rulesetItems.unsubscribe();
      });
    };
  }, ["clickHandler"]);

  const dismissContentCard = (items) => {
    dismissHandler(items).then(() => {
      alloyInstance("evaluateRulesets", {
        renderDecisions: true,
      });
    });
  };

  const onClickedContentCard = (items) => {
    if (items.length === 0) {
      return;
    }

    clickHandler(items);

    const { actionUrl = "" } = items[0];
    if (typeof actionUrl !== "string" || actionUrl.length === 0) {
      return;
    }

    window.location.href = actionUrl;
  };

  const shareSocialMedia = () => {
    alloyInstance("evaluateRulesets", {
      renderDecisions: true,
      personalization: {
        decisionContext: {
          action: "share-social-media",
        },
      },
    });
  };

  const depositFunds = () => {
    alloyInstance("evaluateRulesets", {
      renderDecisions: true,
      personalization: {
        decisionContext: {
          action: "deposit-funds",
        },
      },
    });
  };

  const renderContentCards = () => {
    Promise.all([
      alloyInstance("subscribeContentCards", {
        surface,
        callback: ({ items = [], rendered, clicked, dismissed }) => {
          setClickHandler(() => clicked);
          setDismissHandler(() => dismissed);
          setContentCards(items);
          rendered(items);
        },
      }),
      // alloyInstance("evaluateRulesets")
      // alloyInstance("sendEvent", {
      //   renderDecisions: true,
      //   type: "decisioning.propositionFetch",
      //   personalization: {
      //     surfaces: [surface],
      //     decisionContext: { ...decisionContext },
      //     sendDisplayEvent: false
      //   }
      // })
    ]);
  };

  const resetPersistentData = () => {
    deleteAllCookies();
    localStorage.clear();
    localStorage.setItem("iam-configKey", configKey);
    localStorage.setItem("iam-responseSource", responseSource);
    window.location.reload();
  };

  const setResponseSource = (value) => {
    responseSource = value;
    localStorage.setItem("iam-responseSource", responseSource);
    resetPersistentData();
  };

  return (
    <div>
      <ContentSecurityPolicy />
      <div>
        <label htmlFor="cars">Response Source:</label>
        <select
          id="responseSource"
          name="responseSource"
          onChange={(evt) => setResponseSource(evt.target.value)}
          defaultValue={responseSource}
        >
          <option key="mock" value="mock">
            Mock
          </option>
          <option key="edge" value="edge">
            Edge
          </option>
        </select>
      </div>
      <div style={{ margin: "10px 0" }}>
        <button id="social-media-share" onClick={() => shareSocialMedia()}>
          Share on social media
        </button>
        <button id="deposit-funds" onClick={() => depositFunds()}>
          Deposit funds
        </button>
        <button id="reset" onClick={() => renderContentCards()}>
          Render Content Cards
        </button>
        <button id="reset" onClick={() => resetPersistentData()}>
          Reset
        </button>
      </div>
      <div style={{ margin: "30px 0", maxWidth: "1000px" }}>
        <h3>Content Cards</h3>
        <div id="content-cards">
          {contentCards.map((item, index) => (
            <div
              key={index}
              className="pretty-card"
              onClick={() => onClickedContentCard([item])}
            >
              <button
                onClick={(evt) => {
                  evt.stopPropagation();
                  dismissContentCard([item]);
                }}
              >
                dismiss
              </button>
              <p>{item.title}</p>
              <p>
                {item.imageUrl && <img src={item.imageUrl} alt="Item Image" />}
              </p>
              <p>{item.body}</p>
              <p>Published: {prettyDate(item.publishedDate)}</p>
              <p>Qualified: {prettyDate(item.qualifiedDate)}</p>
              <p>Displayed: {prettyDate(item.displayedDate)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
