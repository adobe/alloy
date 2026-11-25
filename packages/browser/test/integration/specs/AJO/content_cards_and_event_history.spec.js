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
import alloyConfig from "../../helpers/alloy/config.js";
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
} from "../../helpers/testsSetup/extend.js";
import {
  contentCardsAndEventHistoryOperationsOnSendEvent,
  contentCardsAndEventHistoryOperations,
} from "../../helpers/mswjs/handlers.js";

const cardSurface = "web://mywebsite.com/#my-cards";
const cardSchema = "https://ns.adobe.com/personalization/message/content-card";
const cardId = "content-card-item";
const propositionId = "content-card-proposition";
const activityId = "content-card-activity";

const cardResponse = ({ expired = false, requiresAction = false } = {}) => {
  const now = Math.ceil(Date.now() / 1000);
  const expiryDate = now + (expired ? -3600 : 864000);
  const conditions = [
    {
      definition: { key: "~timestampu", matcher: "le", values: [expiryDate] },
      type: "matcher",
    },
  ];
  if (requiresAction) {
    conditions.push({
      definition: {
        conditions: [
          {
            definition: {
              events: [{ "iam.eventType": "trigger", "iam.id": activityId }],
              matcher: "ge",
              value: 1,
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
              ],
              logic: "and",
            },
            type: "group",
          },
        ],
        logic: "or",
      },
      type: "group",
    });
  }
  return {
    requestId: "content-card-response",
    handle: [
      {
        type: "identity:result",
        payload: [
          {
            id: "54671057599843051332294448941462242513",
            namespace: { code: "ECID" },
          },
        ],
      },
      {
        type: "personalization:decisions",
        eventIndex: 0,
        payload: [
          {
            id: propositionId,
            scope: cardSurface,
            scopeDetails: {
              decisionProvider: "AJO",
              correlationID: "6dae465b-9553-4fc6-b7d4-6c9979c88f21-0",
              characteristics: {
                eventToken:
                  "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6IlVFOkluYm91bmQiLCJtZXNzYWdlSUQiOiJmMzgxZWJhYS1kNDIyLTQxNzQtOWUzNS0yMTY3NDYwMjk5MTAiLCJtZXNzYWdlUHVibGljYXRpb25JRCI6IjZkYWU0NjViLTk1NTMtNGZjNi1iN2Q0LTZjOTk3OWM4OGYyMSIsIm1lc3NhZ2VUeXBlIjoibWFya2V0aW5nIiwiY2FtcGFpZ25JRCI6ImVhZDg5MWE0LTNjYWUtNGE1ZC05MGEzLTFkZTc0MzkwYjNkMyIsImNhbXBhaWduVmVyc2lvbklEIjoiZDhiYzk5YmMtZGRhZC00Y2MyLThlYjItYTJlMGUzY2FmNzg0IiwiY2FtcGFpZ25BY3Rpb25JRCI6IjQzNmZmM2NkLTZkZWItNDczNi04NDc1LTA3NDhhYzc4MTlkOCJ9LCJtZXNzYWdlUHJvZmlsZSI6eyJtZXNzYWdlUHJvZmlsZUlEIjoiMDg5NGYwNmYtOTkyNi00YTc2LTk4OTktYThmZjc3NWZmNTA4IiwiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvd2ViIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy93ZWIifX19",
              },
              activity: { id: activityId },
            },
            items: [
              {
                id: cardId,
                schema: "https://ns.adobe.com/personalization/ruleset-item",
                data: {
                  version: 1,
                  rules: [
                    {
                      condition: {
                        type: "group",
                        definition: { conditions, logic: "and" },
                      },
                      consequences: [
                        {
                          id: cardId,
                          type: "schema",
                          detail: {
                            id: cardId,
                            schema: cardSchema,
                            data: {
                              expiryDate,
                              publishedDate: now - 864000,
                              meta: { surface: cardSurface },
                              content: {
                                shouldPinToTop: false,
                                imageUrl:
                                  "https://raw.githubusercontent.com/jasonwaters/assets/master/2024/05/img_20240523_1716483354.png",
                                actionTitle: "View balance",
                                actionUrl: "https://paypal.com",
                                body: "Now you're ready to earn!",
                                title: "Funds deposited.",
                              },
                              contentType: "application/json",
                            },
                          },
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  };
};

const mockNotifications = (worker) => {
  worker.use(
    http.post(/\/v1\/(interact|collect)/, () =>
      HttpResponse.json({ requestId: "notification-ack", handle: [] }),
    ),
  );
};

const getNotifications = async (networkRecorder, minCalls) => {
  let notifications;
  await expect
    .poll(async () => {
      const calls = await networkRecorder.findCalls(
        /\/v1\/(interact|collect)/,
        { retries: 1 },
      );
      notifications = calls
        .map((call) => call.request.body.events[0].xdm)
        .filter(({ eventType }) =>
          eventType?.startsWith("decisioning.proposition"),
        );
      return notifications.length;
    })
    .toBeGreaterThanOrEqual(minCalls);
  return notifications;
};

const subscribeAndRenderCards = async (alloy) => {
  const list = document.createElement("ul");
  list.id = "content-cards";
  document.body.appendChild(list);
  const results = [];
  await alloy("subscribeRulesetItems", {
    surfaces: [cardSurface],
    schemas: [cardSchema],
    callback: ({ propositions }, collectEvent) => {
      results.push(propositions);
      list.replaceChildren();
      propositions.forEach((proposition) => {
        proposition.items.forEach((item) => {
          const card = document.createElement("li");
          const link = document.createElement("a");
          link.href = item.data.content.actionUrl;
          link.textContent = item.data.content.actionTitle;
          link.addEventListener("click", (event) => event.preventDefault());
          card.append(item.data.content.title, link);
          card.addEventListener("click", () =>
            collectEvent("interact", [proposition]),
          );
          list.append(card);
        });
      });
      if (propositions.length) {
        collectEvent("display", propositions);
      }
    },
  });
  return { list, results };
};

describe("AJO content cards and event history operations", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    document.getElementById("content-cards")?.remove();
  });

  test("C1234567: subscribed cards render and send display and interaction notifications", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    mockNotifications(worker);
    await alloy("configure", {
      ...alloyConfig,
      personalizationStorageEnabled: true,
    });
    await alloy("applyResponse", {
      renderDecisions: true,
      responseBody: cardResponse({ requiresAction: true }),
    });
    const { list, results } = await subscribeAndRenderCards(alloy);
    await alloy("evaluateRulesets", {
      renderDecisions: true,
      personalization: { decisionContext: { action: "unrelated" } },
    });
    expect(results.at(-1)).toEqual([]);
    expect(list.children).toHaveLength(0);
    await alloy("evaluateRulesets", {
      renderDecisions: true,
      personalization: { decisionContext: { action: "deposit-funds" } },
    });

    expect(results.at(-1)).toHaveLength(1);
    expect(list.children).toHaveLength(1);
    expect(list.textContent).toContain("Funds deposited.");
    expect(list.textContent).toContain("View balance");
    expect(
      (await getNotifications(networkRecorder, 1)).map(
        ({ eventType }) => eventType,
      ),
    ).toEqual(["decisioning.propositionDisplay"]);
    list.querySelector("li").click();

    const notifications = await getNotifications(networkRecorder, 2);
    expect(notifications.map(({ eventType }) => eventType)).toEqual([
      "decisioning.propositionDisplay",
      "decisioning.propositionInteract",
    ]);
    expect(notifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: "decisioning.propositionDisplay",
          _experience: {
            decisioning: expect.objectContaining({
              propositions: [
                expect.objectContaining({
                  id: propositionId,
                  scope: cardSurface,
                }),
              ],
            }),
          },
        }),
        expect.objectContaining({
          eventType: "decisioning.propositionInteract",
          _experience: {
            decisioning: expect.objectContaining({
              propositions: [
                expect.objectContaining({
                  id: propositionId,
                  scope: cardSurface,
                }),
              ],
            }),
          },
        }),
      ]),
    );
  });

  test("C1234567: expired content cards are not delivered, rendered, or reported", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    mockNotifications(worker);
    await alloy("configure", {
      ...alloyConfig,
      personalizationStorageEnabled: true,
    });
    await alloy("applyResponse", {
      renderDecisions: true,
      responseBody: cardResponse({ expired: true }),
    });
    const { list, results } = await subscribeAndRenderCards(alloy);
    await alloy("evaluateRulesets", {
      renderDecisions: true,
      personalization: { decisionContext: {} },
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.flat()).toEqual([]);
    expect(list.children).toHaveLength(0);
    await networkRecorder.waitForIdle();
    expect(
      await networkRecorder.findCalls(/\/v1\/(interact|collect)/, {
        retries: 1,
        delayMs: 50,
      }),
    ).toEqual([]);
  });

  test("C1234567: collectEvent tracks a content card action", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    mockNotifications(worker);
    await alloy("configure", {
      ...alloyConfig,
      personalizationStorageEnabled: true,
    });
    await alloy("applyResponse", {
      renderDecisions: true,
      responseBody: cardResponse(),
    });
    const { list } = await subscribeAndRenderCards(alloy);
    await alloy("evaluateRulesets", {
      renderDecisions: true,
      personalization: { decisionContext: {} },
    });
    expect(list.children).toHaveLength(1);
    list.querySelector("a").click();

    const notifications = await getNotifications(networkRecorder, 2);
    const interaction = notifications.find(
      ({ eventType }) => eventType === "decisioning.propositionInteract",
    );
    expect(interaction?._experience.decisioning.propositions).toEqual([
      expect.objectContaining({ id: propositionId, scope: cardSurface }),
    ]);

    const storageKey = `com.adobe.alloy.${alloyConfig.orgId.replace("@", "_")}.decisioning.events`;
    const history = () => JSON.parse(localStorage.getItem(storageKey) || "{}");
    // Hashes of eventId:content-card-activity and eventType:display/interact.
    await expect
      .poll(() => history()["28f63df4"]?.timestamps)
      .toEqual([expect.any(Number)]);
    await expect
      .poll(() => history()["38870308"]?.timestamps)
      .toEqual([expect.any(Number)]);
  });

  test("are processed correctly on send event response", async ({
    worker,
    alloy,
  }) => {
    let contentCards;

    worker.use(contentCardsAndEventHistoryOperationsOnSendEvent);

    alloy("configure", {
      ...alloyConfig,
      personalizationStorageEnabled: true,
    });

    alloy("subscribeRulesetItems", {
      surfaces: ["web://testing.alloy.adobe.com"],
      schemas: ["https://ns.adobe.com/personalization/message/content-card"],
      callback: (result) => {
        contentCards = result.propositions;
      },
    });

    await alloy("sendEvent", {
      renderDecisions: true,
      personalization: {
        surfaces: ["web://testing.alloy.adobe.com"],
      },
    });

    expect(
      JSON.parse(
        localStorage.getItem(
          "com.adobe.alloy.5BFE274A5F6980A50A495C08_AdobeOrg.decisioning.events",
        ),
      )?.dbd4a4c4?.timestamps.length,
    ).toBe(1);
    expect(contentCards.length).toBe(1);
  });

  test("are processed correctly on evaluate rulesets", async ({
    worker,
    alloy,
  }) => {
    let contentCards;

    worker.use(contentCardsAndEventHistoryOperations);

    alloy("configure", {
      ...alloyConfig,
      personalizationStorageEnabled: true,
    });

    alloy("subscribeRulesetItems", {
      surfaces: ["web://testing.alloy.adobe.com"],
      schemas: ["https://ns.adobe.com/personalization/message/content-card"],
      callback: (result) => {
        contentCards = result.propositions;
      },
    });

    await alloy("sendEvent", {
      renderDecisions: true,
      personalization: {
        surfaces: ["web://testing.alloy.adobe.com"],
      },
    });

    expect(
      JSON.parse(
        localStorage.getItem(
          "com.adobe.alloy.5BFE274A5F6980A50A495C08_AdobeOrg.decisioning.events",
        ),
      )?.dbd4a4c4?.timestamps.length,
    ).toBe(undefined);
    expect(contentCards.length).toBe(0);

    await alloy("evaluateRulesets", {
      renderDecisions: true,
      personalization: {
        decisionContext: {
          "~source": "someOtherValue",
        },
      },
    });

    expect(
      JSON.parse(
        localStorage.getItem(
          "com.adobe.alloy.5BFE274A5F6980A50A495C08_AdobeOrg.decisioning.events",
        ),
      )?.dbd4a4c4?.timestamps.length,
    ).toBe(1);
    expect(contentCards.length).toBe(1);
  });
});
