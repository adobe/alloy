import React, { useEffect, useState } from "react";
import ContentSecurityPolicy from "../ContentSecurityPolicy";
import "./MessageFeed.css";

const mockResponse = {
  requestId: "5a38a9ef-67d7-4f66-8977-c4dc0e0967b6",
  handle: [
    {
      payload: [
        {
          id: "11893040138696185741718511332124641876",
          namespace: {
            code: "ECID"
          }
        }
      ],
      type: "identity:result"
    },
    {
      payload: [
        {
          scopeDetails: {
            decisionProvider: "AJO",
            characteristics: {
              eventToken:
                "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6Ik5BIiwibWVzc2FnZUlEIjoiMDJjNzdlYTgtN2MwZS00ZDMzLTgwOTAtNGE1YmZkM2Q3NTAzIiwibWVzc2FnZVR5cGUiOiJtYXJrZXRpbmciLCJjYW1wYWlnbklEIjoiMzlhZThkNGItYjU1ZS00M2RjLWExNDMtNzdmNTAxOTViNDg3IiwiY2FtcGFpZ25WZXJzaW9uSUQiOiJiZDg1ZDllOC0yMDM3LTQyMmYtYjZkMi0zOTU3YzkwNTU5ZDMiLCJjYW1wYWlnbkFjdGlvbklEIjoiYjQ3ZmRlOGItNTdjMS00YmJlLWFlMjItNjRkNWI3ODJkMTgzIiwibWVzc2FnZVB1YmxpY2F0aW9uSUQiOiJhZTUyY2VkOC0yMDBjLTQ5N2UtODc4Ny1lZjljZmMxNzgyMTUifSwibWVzc2FnZVByb2ZpbGUiOnsiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvd2ViIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy93ZWIifSwibWVzc2FnZVByb2ZpbGVJRCI6ImY1Y2Q5OTk1LTZiNDQtNDIyMS05YWI3LTViNTMzOGQ1ZjE5MyJ9fQ=="
            },
            strategies: [
              {
                strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
                treatmentID: "yu7rkogezumca7i0i44v"
              }
            ],
            activity: {
              id:
                "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183"
            },
            correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503"
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
                              conditions: [
                                {
                                  definition: {
                                    key: "events",
                                    matcher: "ex"
                                  },
                                  type: "matcher"
                                }
                              ],
                              logic: "and"
                            },
                            type: "group"
                          }
                        ],
                        logic: "and"
                      },
                      type: "group"
                    },
                    consequences: [
                      {
                        type: "schema",
                        detail: {
                          schema:
                            "https://ns.adobe.com/personalization/message/feed-item",
                          data: {
                            expiryDate: 1712190456,
                            publishedDate: 1677752640000,
                            meta: {
                              feedName: "Winter Promo",
                              surface:
                                "mobileapp://com.adobe.sampleApp/feed/promos"
                            },
                            content: {
                              imageUrl:
                                "https://target.jasonwaters.dev/img/lumon.png",
                              actionTitle: "Shop the sale!",
                              actionUrl: "https://luma.com/sale",
                              body: "a handshake is available upon request.",
                              title: "Welcome to Lumon!"
                            },
                            contentType: "application/json"
                          },
                          id: "a48ca420-faea-467e-989a-5d179d9f562d"
                        },
                        id: "a48ca420-faea-467e-989a-5d179d9f562d"
                      },
                      {
                        type: "schema",
                        detail: {
                          schema:
                            "https://ns.adobe.com/personalization/message/feed-item",
                          data: {
                            expiryDate: 1712190456,
                            publishedDate: 1677839040000,
                            meta: {
                              feedName: "Winter Promo",
                              surface:
                                "mobileapp://com.adobe.sampleApp/feed/promos"
                            },
                            content: {
                              imageUrl:
                                "https://media.giphy.com/media/l0Ex3vQtX5VX2YtAQ/giphy.gif",
                              actionTitle: "Shop the sale!",
                              actionUrl: "https://luma.com/sale",
                              body: "Great job, you completed your profile.",
                              title: "Achievement Unlocked!"
                            },
                            contentType: "application/json"
                          },
                          id: "b7173290-588f-40c6-a05c-43ed5ec08b28"
                        },
                        id: "b7173290-588f-40c6-a05c-43ed5ec08b28"
                      }
                    ]
                  }
                ]
              }
            }
          ],
          scope: "web://target.jasonwaters.dev/aep.html"
        },
        {
          scopeDetails: {
            decisionProvider: "AJO",
            characteristics: {
              eventToken:
                "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6Ik5BIiwibWVzc2FnZUlEIjoiMDJjNzdlYTgtN2MwZS00ZDMzLTgwOTAtNGE1YmZkM2Q3NTAzIiwibWVzc2FnZVR5cGUiOiJtYXJrZXRpbmciLCJjYW1wYWlnbklEIjoiMzlhZThkNGItYjU1ZS00M2RjLWExNDMtNzdmNTAxOTViNDg3IiwiY2FtcGFpZ25WZXJzaW9uSUQiOiJiZDg1ZDllOC0yMDM3LTQyMmYtYjZkMi0zOTU3YzkwNTU5ZDMiLCJjYW1wYWlnbkFjdGlvbklEIjoiYjQ3ZmRlOGItNTdjMS00YmJlLWFlMjItNjRkNWI3ODJkMTgzIiwibWVzc2FnZVB1YmxpY2F0aW9uSUQiOiJhZTUyY2VkOC0yMDBjLTQ5N2UtODc4Ny1lZjljZmMxNzgyMTUifSwibWVzc2FnZVByb2ZpbGUiOnsiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvd2ViIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy93ZWIifSwibWVzc2FnZVByb2ZpbGVJRCI6ImY1Y2Q5OTk1LTZiNDQtNDIyMS05YWI3LTViNTMzOGQ1ZjE5MyJ9fQ=="
            },
            strategies: [
              {
                strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
                treatmentID: "yu7rkogezumca7i0i44v"
              }
            ],
            activity: {
              id:
                "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183"
            },
            correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503"
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
                              conditions: [
                                {
                                  definition: {
                                    key: "action",
                                    matcher: "eq",
                                    values: ["share-social-media"]
                                  },
                                  type: "matcher"
                                },
                                {
                                  definition: {
                                    events: [
                                      {
                                        type: "decisioning.propositionDisplay",
                                        id:
                                          "1ae11bc5-96dc-41c7-8f71-157c57a5290e"
                                      }
                                    ],
                                    matcher: "ge",
                                    value: 1
                                  },
                                  type: "historical"
                                }
                              ],
                              logic: "or"
                            },
                            type: "group"
                          }
                        ],
                        logic: "and"
                      },
                      type: "group"
                    },
                    consequences: [
                      {
                        type: "schema",
                        detail: {
                          schema:
                            "https://ns.adobe.com/personalization/message/feed-item",
                          data: {
                            expiryDate: 1712190456,
                            publishedDate: 1678098240000,
                            meta: {
                              feedName: "Winter Promo",
                              surface:
                                "mobileapp://com.adobe.sampleApp/feed/promos"
                            },
                            content: {
                              imageUrl:
                                "https://target.jasonwaters.dev/img/twitter.png",
                              actionTitle: "Shop the sale!",
                              actionUrl: "https://luma.com/sale",
                              body:
                                "Posting on social media helps us spread the word.",
                              title: "Thanks for sharing!"
                            },
                            contentType: "application/json"
                          },
                          id: "cfcb1af7-7bc2-45b2-a86a-0aa93fe69ce7"
                        },
                        id: "cfcb1af7-7bc2-45b2-a86a-0aa93fe69ce7"
                      }
                    ]
                  }
                ]
              }
            }
          ],
          scope: "web://target.jasonwaters.dev/aep.html"
        },
        {
          scopeDetails: {
            decisionProvider: "AJO",
            characteristics: {
              eventToken:
                "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6Ik5BIiwibWVzc2FnZUlEIjoiMDJjNzdlYTgtN2MwZS00ZDMzLTgwOTAtNGE1YmZkM2Q3NTAzIiwibWVzc2FnZVR5cGUiOiJtYXJrZXRpbmciLCJjYW1wYWlnbklEIjoiMzlhZThkNGItYjU1ZS00M2RjLWExNDMtNzdmNTAxOTViNDg3IiwiY2FtcGFpZ25WZXJzaW9uSUQiOiJiZDg1ZDllOC0yMDM3LTQyMmYtYjZkMi0zOTU3YzkwNTU5ZDMiLCJjYW1wYWlnbkFjdGlvbklEIjoiYjQ3ZmRlOGItNTdjMS00YmJlLWFlMjItNjRkNWI3ODJkMTgzIiwibWVzc2FnZVB1YmxpY2F0aW9uSUQiOiJhZTUyY2VkOC0yMDBjLTQ5N2UtODc4Ny1lZjljZmMxNzgyMTUifSwibWVzc2FnZVByb2ZpbGUiOnsiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvd2ViIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy93ZWIifSwibWVzc2FnZVByb2ZpbGVJRCI6ImY1Y2Q5OTk1LTZiNDQtNDIyMS05YWI3LTViNTMzOGQ1ZjE5MyJ9fQ=="
            },
            strategies: [
              {
                strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
                treatmentID: "yu7rkogezumca7i0i44v"
              }
            ],
            activity: {
              id:
                "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183"
            },
            correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503"
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
                              conditions: [
                                {
                                  definition: {
                                    key: "action",
                                    matcher: "eq",
                                    values: ["deposit-funds"]
                                  },
                                  type: "matcher"
                                },
                                {
                                  definition: {
                                    events: [
                                      {
                                        type: "decisioning.propositionDisplay",
                                        id:
                                          "d1f7d411-a549-47bc-a4d8-c8e638b0a46b"
                                      }
                                    ],
                                    matcher: "ge",
                                    value: 1
                                  },
                                  type: "historical"
                                }
                              ],
                              logic: "or"
                            },
                            type: "group"
                          }
                        ],
                        logic: "and"
                      },
                      type: "group"
                    },
                    consequences: [
                      {
                        type: "schema",
                        detail: {
                          schema:
                            "https://ns.adobe.com/personalization/message/feed-item",
                          data: {
                            expiryDate: 1712190456,
                            publishedDate: 1678184640000,
                            meta: {
                              feedName: "Winter Promo",
                              surface:
                                "mobileapp://com.adobe.sampleApp/feed/promos"
                            },
                            content: {
                              imageUrl:
                                "https://media.giphy.com/media/ADgfsbHcS62Jy/giphy.gif",
                              actionTitle: "Shop the sale!",
                              actionUrl: "https://luma.com/sale",
                              body: "Now you're ready to earn!",
                              title: "Funds deposited!"
                            },
                            contentType: "application/json"
                          },
                          id: "0263e171-fa32-4c7a-9611-36b28137a81d"
                        },
                        id: "0263e171-fa32-4c7a-9611-36b28137a81d"
                      }
                    ]
                  }
                ]
              }
            }
          ],
          scope: "web://target.jasonwaters.dev/aep.html"
        }
      ],
      type: "personalization:decisions",
      eventIndex: 0
    },
    {
      payload: [
        {
          scope: "Target",
          hint: "35",
          ttlSeconds: 1800
        },
        {
          scope: "AAM",
          hint: "9",
          ttlSeconds: 1800
        },
        {
          scope: "EdgeNetwork",
          hint: "or2",
          ttlSeconds: 1800
        }
      ],
      type: "locationHint:result"
    },
    {
      payload: [
        {
          key: "kndctr_4DA0571C5FDC4BF70A495FC2_AdobeOrg_cluster",
          value: "or2",
          maxAge: 1800,
          attrs: {
            SameSite: "None"
          }
        }
      ],
      type: "state:store"
    }
  ]
};

const prettyDate = value => {
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

export default function MessageFeed() {
  const [clickHandler, setClickHandler] = useState(() => items =>
    console.log("items clicked!", items)
  );

  const [messageFeedItems, setMessageFeedItems] = useState([]);

  useEffect(() => {
    Promise.all([
      window.alloy("subscribeRulesetItems", {
        surfaces: ["web://target.jasonwaters.dev/aep.html"],
        callback: result => {
          console.log("subscribeRulesetItems", result);
        }
      }),
      window.alloy("subscribeMessageFeed", {
        surface: "web://target.jasonwaters.dev/aep.html",
        callback: ({ items = [], rendered, clicked }) => {
          setClickHandler(() => clicked);

          setMessageFeedItems(items);
          rendered(items);
        }
      }),
      window.alloy("applyResponse", {
        renderDecisions: true,
        responseBody: mockResponse
      })
    ]);
  }, []);

  const shareSocialMedia = () => {
    window.alloy("evaluateRulesets", {
      renderDecisions: true,
      decisionContext: {
        action: "share-social-media"
      }
    });
  };

  const depositFunds = () => {
    window.alloy("evaluateRulesets", {
      renderDecisions: true,
      decisionContext: {
        action: "deposit-funds"
      }
    });
  };

  const resetPersistentData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div>
      <ContentSecurityPolicy />
      <div style={{ margin: "10px 0" }}>
        <button id="social-media-share" onClick={() => shareSocialMedia()}>
          Share on social media
        </button>
        <button id="deposit-funds" onClick={() => depositFunds()}>
          Deposit funds
        </button>
        <button id="reset" onClick={() => resetPersistentData()}>
          Reset
        </button>
      </div>
      <div style={{ margin: "30px 0" }}>
        <h3>Message Feed</h3>
        <div id="message-feed">
          {messageFeedItems.map((item, index) => (
            <div
              key={index}
              className="pretty-card"
              onClick={() => clickHandler([item])}
            >
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
