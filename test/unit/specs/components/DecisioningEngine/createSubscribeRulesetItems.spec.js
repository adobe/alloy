/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import {
  DOM_ACTION,
  MESSAGE_FEED_ITEM,
} from "../../../../../src/constants/schema";
import createSubscribeRulesetItems from "../../../../../src/components/DecisioningEngine/createSubscribeRulesetItems.js";

describe("DecisioningEngine:subscribeRulesetItems", () => {
  let subscribeRulesetItems;

  const PROPOSITIONS = [
    {
      id: "abc",
      items: [
        {
          schema: DOM_ACTION,
          data: {
            selector: "a",
            type: "setAttribute",
            content: {
              src: "img/test.png",
            },
            prehidingSelector: "a",
            qualifiedDate: 1694198274647,
            displayedDate: 1694198274647,
          },
          id: "aabbcc",
        },
      ],
      scope: "web://something.com",
      scopeDetails: {
        decisionProvider: "AJO",
      },
    },
    {
      id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
      items: [
        {
          schema: DOM_ACTION,
          data: {
            selector: "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
            type: "setAttribute",
            content: {
              src: "img/demo-marketing-offer1-exp-A.png",
            },
            prehidingSelector:
              "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)",
            qualifiedDate: 1683042673380,
            displayedDate: 1683042673395,
          },
          id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
        },
        {
          schema: DOM_ACTION,
          data: {
            selector: "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
            type: "setHtml",
            content: "Hello Treatment A!",
            prehidingSelector:
              "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
            qualifiedDate: 1683042673387,
            displayedDate: 1683042673395,
          },
          id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f",
        },
      ],
      scope: "web://mywebsite.com/feed",
    },
    {
      id: "1a3d874f-39ee-4310-bfa9-6559a10041a4",
      items: [
        {
          schema: MESSAGE_FEED_ITEM,
          data: {
            expiryDate: 1712190456,
            publishedDate: 1677752640000,
            meta: {
              feedName: "Winter Promo",
              surface: "web://mywebsite.com/feed",
            },
            content: {
              imageUrl: "img/lumon.png",
              actionTitle: "Shop the sale!",
              actionUrl: "https://luma.com/sale",
              body: "a handshake is available upon request.",
              title: "Welcome to Lumon!",
            },
            contentType: "application/json",
            qualifiedDate: 1683042628060,
            displayedDate: 1683042628070,
          },
          id: "a48ca420-faea-467e-989a-5d179d9f562d",
        },
        {
          schema: MESSAGE_FEED_ITEM,
          data: {
            expiryDate: 1712190456,
            publishedDate: 1677839040000,

            meta: {
              feedName: "Winter Promo",
              surface: "web://mywebsite.com/feed",
            },
            content: {
              imageUrl: "img/achievement.png",
              actionTitle: "Shop the sale!",
              actionUrl: "https://luma.com/sale",
              body: "Great job, you completed your profile.",
              title: "Achievement Unlocked!",
            },
            contentType: "application/json",
            qualifiedDate: 1683042628064,
            displayedDate: 1683042628070,
          },
          id: "b7173290-588f-40c6-a05c-43ed5ec08b28",
        },
      ],
      scope: "web://mywebsite.com/feed",
    },
    {
      id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
      items: [
        {
          schema: MESSAGE_FEED_ITEM,
          data: {
            expiryDate: 1712190456,
            publishedDate: 1678098240000,
            meta: {
              feedName: "Winter Promo",
              surface: "web://mywebsite.com/feed",
            },
            content: {
              imageUrl: "img/twitter.png",
              actionTitle: "Shop the sale!",
              actionUrl: "https://luma.com/sale",
              body: "Posting on social media helps us spread the word.",
              title: "Thanks for sharing!",
            },
            contentType: "application/json",
            qualifiedDate: 1683042658312,
            displayedDate: 1683042658316,
          },
          id: "cfcb1af7-7bc2-45b2-a86a-0aa93fe69ce7",
        },
      ],
      scope: "web://mywebsite.com/feed",
      scopeDetails: {
        id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
        scope: "web://mywebsite.com/feed",
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
            id: "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183",
          },
          correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503",
        },
      },
    },
    {
      id: "d1f7d411-a549-47bc-a4d8-c8e638b0a46b",
      items: [
        {
          schema: MESSAGE_FEED_ITEM,
          data: {
            expiryDate: 1712190456,
            publishedDate: 1678184640000,
            meta: {
              feedName: "Winter Promo",
              surface: "web://mywebsite.com/feed",
            },
            content: {
              imageUrl: "img/gold-coin.jpg",
              actionTitle: "Shop the sale!",
              actionUrl: "https://luma.com/sale",
              body: "Now you're ready to earn!",
              title: "Funds deposited!",
            },
            contentType: "application/json",
            qualifiedDate: 1683042653905,
            displayedDate: 1683042653909,
          },
          id: "0263e171-fa32-4c7a-9611-36b28137a81d",
        },
      ],
      scope: "web://mywebsite.com/feed",
    },
  ];

  beforeEach(() => {
    subscribeRulesetItems = createSubscribeRulesetItems();
  });

  it("has a command defined", () => {
    const { command } = subscribeRulesetItems;

    expect(command).toEqual({
      optionsValidator: jasmine.any(Function),
      run: jasmine.any(Function),
    });
  });

  it("calls the callback with list of feed items", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    // register a subscription.  equivalent to alloy("subscribeRulesetItems", ...
    command.run({
      surfaces: ["web://mywebsite.com/feed"],
      schemas: [MESSAGE_FEED_ITEM],
      callback,
    });

    refresh(PROPOSITIONS);
    expect(callback).toHaveBeenCalledOnceWith({
      propositions: [
        {
          id: "1a3d874f-39ee-4310-bfa9-6559a10041a4",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/message/feed-item",
              data: {
                expiryDate: 1712190456,
                publishedDate: 1677752640000,
                meta: {
                  feedName: "Winter Promo",
                  surface: "web://mywebsite.com/feed",
                },
                content: {
                  imageUrl: "img/lumon.png",
                  actionTitle: "Shop the sale!",
                  actionUrl: "https://luma.com/sale",
                  body: "a handshake is available upon request.",
                  title: "Welcome to Lumon!",
                },
                contentType: "application/json",
                qualifiedDate: 1683042628060,
                displayedDate: 1683042628070,
              },
              id: "a48ca420-faea-467e-989a-5d179d9f562d",
            },
            {
              schema: "https://ns.adobe.com/personalization/message/feed-item",
              data: {
                expiryDate: 1712190456,
                publishedDate: 1677839040000,
                meta: {
                  feedName: "Winter Promo",
                  surface: "web://mywebsite.com/feed",
                },
                content: {
                  imageUrl: "img/achievement.png",
                  actionTitle: "Shop the sale!",
                  actionUrl: "https://luma.com/sale",
                  body: "Great job, you completed your profile.",
                  title: "Achievement Unlocked!",
                },
                contentType: "application/json",
                qualifiedDate: 1683042628064,
                displayedDate: 1683042628070,
              },
              id: "b7173290-588f-40c6-a05c-43ed5ec08b28",
            },
          ],
          scope: "web://mywebsite.com/feed",
        },
        {
          id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/message/feed-item",
              data: {
                expiryDate: 1712190456,
                publishedDate: 1678098240000,
                meta: {
                  feedName: "Winter Promo",
                  surface: "web://mywebsite.com/feed",
                },
                content: {
                  imageUrl: "img/twitter.png",
                  actionTitle: "Shop the sale!",
                  actionUrl: "https://luma.com/sale",
                  body: "Posting on social media helps us spread the word.",
                  title: "Thanks for sharing!",
                },
                contentType: "application/json",
                qualifiedDate: 1683042658312,
                displayedDate: 1683042658316,
              },
              id: "cfcb1af7-7bc2-45b2-a86a-0aa93fe69ce7",
            },
          ],
          scope: "web://mywebsite.com/feed",
          scopeDetails: {
            id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
            scope: "web://mywebsite.com/feed",
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
                id: "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183",
              },
              correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503",
            },
          },
        },
        {
          id: "d1f7d411-a549-47bc-a4d8-c8e638b0a46b",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/message/feed-item",
              data: {
                expiryDate: 1712190456,
                publishedDate: 1678184640000,
                meta: {
                  feedName: "Winter Promo",
                  surface: "web://mywebsite.com/feed",
                },
                content: {
                  imageUrl: "img/gold-coin.jpg",
                  actionTitle: "Shop the sale!",
                  actionUrl: "https://luma.com/sale",
                  body: "Now you're ready to earn!",
                  title: "Funds deposited!",
                },
                contentType: "application/json",
                qualifiedDate: 1683042653905,
                displayedDate: 1683042653909,
              },
              id: "0263e171-fa32-4c7a-9611-36b28137a81d",
            },
          ],
          scope: "web://mywebsite.com/feed",
        },
      ],
    });
  });

  it("calls the callback with list of dom action items", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    // register a subscription.  equivalent to alloy("subscribeRulesetItems", ...
    command.run({
      surfaces: ["web://mywebsite.com/feed"],
      schemas: [DOM_ACTION],
      callback,
    });

    refresh(PROPOSITIONS);
    expect(callback).toHaveBeenCalledOnceWith({
      propositions: [
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector: "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
                type: "setAttribute",
                content: {
                  src: "img/demo-marketing-offer1-exp-A.png",
                },
                prehidingSelector:
                  "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)",
                qualifiedDate: 1683042673380,
                displayedDate: 1683042673395,
              },
              id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
            },
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector:
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                type: "setHtml",
                content: "Hello Treatment A!",
                prehidingSelector:
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                qualifiedDate: 1683042673387,
                displayedDate: 1683042673395,
              },
              id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f",
            },
          ],
          scope: "web://mywebsite.com/feed",
        },
      ],
    });
  });

  it("calls the callback with list of all schema-based items for single schema", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    // register a subscription.  equivalent to alloy("subscribeRulesetItems", ...
    command.run({
      surfaces: ["web://mywebsite.com/feed"],
      callback,
    });

    refresh(PROPOSITIONS);
    expect(callback).toHaveBeenCalledOnceWith({
      propositions: [
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector: "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
                type: "setAttribute",
                content: {
                  src: "img/demo-marketing-offer1-exp-A.png",
                },
                prehidingSelector:
                  "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)",
                qualifiedDate: 1683042673380,
                displayedDate: 1683042673395,
              },
              id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
            },
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector:
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                type: "setHtml",
                content: "Hello Treatment A!",
                prehidingSelector:
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                qualifiedDate: 1683042673387,
                displayedDate: 1683042673395,
              },
              id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f",
            },
          ],
          scope: "web://mywebsite.com/feed",
        },
        {
          id: "1a3d874f-39ee-4310-bfa9-6559a10041a4",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/message/feed-item",
              data: {
                expiryDate: 1712190456,
                publishedDate: 1677752640000,
                meta: {
                  feedName: "Winter Promo",
                  surface: "web://mywebsite.com/feed",
                },
                content: {
                  imageUrl: "img/lumon.png",
                  actionTitle: "Shop the sale!",
                  actionUrl: "https://luma.com/sale",
                  body: "a handshake is available upon request.",
                  title: "Welcome to Lumon!",
                },
                contentType: "application/json",
                qualifiedDate: 1683042628060,
                displayedDate: 1683042628070,
              },
              id: "a48ca420-faea-467e-989a-5d179d9f562d",
            },
            {
              schema: "https://ns.adobe.com/personalization/message/feed-item",
              data: {
                expiryDate: 1712190456,
                publishedDate: 1677839040000,
                meta: {
                  feedName: "Winter Promo",
                  surface: "web://mywebsite.com/feed",
                },
                content: {
                  imageUrl: "img/achievement.png",
                  actionTitle: "Shop the sale!",
                  actionUrl: "https://luma.com/sale",
                  body: "Great job, you completed your profile.",
                  title: "Achievement Unlocked!",
                },
                contentType: "application/json",
                qualifiedDate: 1683042628064,
                displayedDate: 1683042628070,
              },
              id: "b7173290-588f-40c6-a05c-43ed5ec08b28",
            },
          ],
          scope: "web://mywebsite.com/feed",
        },
        {
          id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/message/feed-item",
              data: {
                expiryDate: 1712190456,
                publishedDate: 1678098240000,
                meta: {
                  feedName: "Winter Promo",
                  surface: "web://mywebsite.com/feed",
                },
                content: {
                  imageUrl: "img/twitter.png",
                  actionTitle: "Shop the sale!",
                  actionUrl: "https://luma.com/sale",
                  body: "Posting on social media helps us spread the word.",
                  title: "Thanks for sharing!",
                },
                contentType: "application/json",
                qualifiedDate: 1683042658312,
                displayedDate: 1683042658316,
              },
              id: "cfcb1af7-7bc2-45b2-a86a-0aa93fe69ce7",
            },
          ],
          scope: "web://mywebsite.com/feed",
          scopeDetails: {
            id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
            scope: "web://mywebsite.com/feed",
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
                id: "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183",
              },
              correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503",
            },
          },
        },
        {
          id: "d1f7d411-a549-47bc-a4d8-c8e638b0a46b",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/message/feed-item",
              data: {
                expiryDate: 1712190456,
                publishedDate: 1678184640000,
                meta: {
                  feedName: "Winter Promo",
                  surface: "web://mywebsite.com/feed",
                },
                content: {
                  imageUrl: "img/gold-coin.jpg",
                  actionTitle: "Shop the sale!",
                  actionUrl: "https://luma.com/sale",
                  body: "Now you're ready to earn!",
                  title: "Funds deposited!",
                },
                contentType: "application/json",
                qualifiedDate: 1683042653905,
                displayedDate: 1683042653909,
              },
              id: "0263e171-fa32-4c7a-9611-36b28137a81d",
            },
          ],
          scope: "web://mywebsite.com/feed",
        },
      ],
    });
  });

  it("filters out all surfaces", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    // register a subscription.  equivalent to alloy("subscribeRulesetItems", ...
    command.run({
      surfaces: [],
      schemas: [MESSAGE_FEED_ITEM],
      callback,
    });

    refresh(PROPOSITIONS);
    expect(callback).not.toHaveBeenCalled();
  });

  it("filters on surface", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    // register a subscription.  equivalent to alloy("subscribeRulesetItems", ...
    command.run({
      surfaces: ["web://something.com"],
      callback,
    });

    refresh(PROPOSITIONS);
    expect(callback).toHaveBeenCalledOnceWith({
      propositions: [
        {
          id: "abc",
          items: [
            jasmine.objectContaining({
              schema: DOM_ACTION,
              data: {
                selector: "a",
                type: "setAttribute",
                content: {
                  src: "img/test.png",
                },
                prehidingSelector: "a",
                qualifiedDate: 1694198274647,
                displayedDate: 1694198274647,
              },
              id: "aabbcc",
            }),
          ],
          scope: "web://something.com",
          scopeDetails: {
            decisionProvider: "AJO",
          },
        },
      ],
    });
  });

  it("returns all surfaces and schemas", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    // register a subscription.  equivalent to alloy("subscribeRulesetItems", ...
    command.run({
      callback,
    });

    refresh(PROPOSITIONS);
    expect(callback).toHaveBeenCalledOnceWith({
      propositions: [
        {
          id: "abc",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector: "a",
                type: "setAttribute",
                content: {
                  src: "img/test.png",
                },
                prehidingSelector: "a",
                qualifiedDate: 1694198274647,
                displayedDate: 1694198274647,
              },
              id: "aabbcc",
            },
          ],
          scope: "web://something.com",
          scopeDetails: {
            decisionProvider: "AJO",
          },
        },
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector: "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
                type: "setAttribute",
                content: {
                  src: "img/demo-marketing-offer1-exp-A.png",
                },
                prehidingSelector:
                  "HTML > BODY > DIV:nth-of-type(2) > IMG:nth-of-type(1)",
                qualifiedDate: 1683042673380,
                displayedDate: 1683042673395,
              },
              id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
            },
            {
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                selector:
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                type: "setHtml",
                content: "Hello Treatment A!",
                prehidingSelector:
                  "HTML > BODY > DIV:nth-of-type(1) > H1:nth-of-type(1)",
                qualifiedDate: 1683042673387,
                displayedDate: 1683042673395,
              },
              id: "10da709c-aa1a-40e5-84dd-966e2e8a1d5f",
            },
          ],
          scope: "web://mywebsite.com/feed",
        },
        {
          id: "1a3d874f-39ee-4310-bfa9-6559a10041a4",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/message/feed-item",
              data: {
                expiryDate: 1712190456,
                publishedDate: 1677752640000,
                meta: {
                  feedName: "Winter Promo",
                  surface: "web://mywebsite.com/feed",
                },
                content: {
                  imageUrl: "img/lumon.png",
                  actionTitle: "Shop the sale!",
                  actionUrl: "https://luma.com/sale",
                  body: "a handshake is available upon request.",
                  title: "Welcome to Lumon!",
                },
                contentType: "application/json",
                qualifiedDate: 1683042628060,
                displayedDate: 1683042628070,
              },
              id: "a48ca420-faea-467e-989a-5d179d9f562d",
            },
            {
              schema: "https://ns.adobe.com/personalization/message/feed-item",
              data: {
                expiryDate: 1712190456,
                publishedDate: 1677839040000,
                meta: {
                  feedName: "Winter Promo",
                  surface: "web://mywebsite.com/feed",
                },
                content: {
                  imageUrl: "img/achievement.png",
                  actionTitle: "Shop the sale!",
                  actionUrl: "https://luma.com/sale",
                  body: "Great job, you completed your profile.",
                  title: "Achievement Unlocked!",
                },
                contentType: "application/json",
                qualifiedDate: 1683042628064,
                displayedDate: 1683042628070,
              },
              id: "b7173290-588f-40c6-a05c-43ed5ec08b28",
            },
          ],
          scope: "web://mywebsite.com/feed",
        },
        {
          id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/message/feed-item",
              data: {
                expiryDate: 1712190456,
                publishedDate: 1678098240000,
                meta: {
                  feedName: "Winter Promo",
                  surface: "web://mywebsite.com/feed",
                },
                content: {
                  imageUrl: "img/twitter.png",
                  actionTitle: "Shop the sale!",
                  actionUrl: "https://luma.com/sale",
                  body: "Posting on social media helps us spread the word.",
                  title: "Thanks for sharing!",
                },
                contentType: "application/json",
                qualifiedDate: 1683042658312,
                displayedDate: 1683042658316,
              },
              id: "cfcb1af7-7bc2-45b2-a86a-0aa93fe69ce7",
            },
          ],
          scope: "web://mywebsite.com/feed",
          scopeDetails: {
            id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
            scope: "web://mywebsite.com/feed",
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
                id: "39ae8d4b-b55e-43dc-a143-77f50195b487#b47fde8b-57c1-4bbe-ae22-64d5b782d183",
              },
              correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503",
            },
          },
        },
        {
          id: "d1f7d411-a549-47bc-a4d8-c8e638b0a46b",
          items: [
            {
              schema: "https://ns.adobe.com/personalization/message/feed-item",
              data: {
                expiryDate: 1712190456,
                publishedDate: 1678184640000,
                meta: {
                  feedName: "Winter Promo",
                  surface: "web://mywebsite.com/feed",
                },
                content: {
                  imageUrl: "img/gold-coin.jpg",
                  actionTitle: "Shop the sale!",
                  actionUrl: "https://luma.com/sale",
                  body: "Now you're ready to earn!",
                  title: "Funds deposited!",
                },
                contentType: "application/json",
                qualifiedDate: 1683042653905,
                displayedDate: 1683042653909,
              },
              id: "0263e171-fa32-4c7a-9611-36b28137a81d",
            },
          ],
          scope: "web://mywebsite.com/feed",
        },
      ],
    });
  });
});
