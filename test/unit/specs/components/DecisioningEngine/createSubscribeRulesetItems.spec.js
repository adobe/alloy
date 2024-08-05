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
  MESSAGE_CONTENT_CARD,
} from "../../../../../src/constants/schema.js";
import createSubscribeRulesetItems from "../../../../../src/components/DecisioningEngine/createSubscribeRulesetItems.js";
import { PropositionEventType } from "../../../../../src/constants/propositionEventType.js";

describe("DecisioningEngine:subscribeRulesetItems", () => {
  let collect;
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
      scope: "web://mywebsite.com/my-cards",
      scopeDetails: {
        decisionProvider: "AJO",
      },
    },
    {
      id: "1a3d874f-39ee-4310-bfa9-6559a10041a4",
      items: [
        {
          schema: MESSAGE_CONTENT_CARD,
          data: {
            expiryDate: 1712190456,
            publishedDate: 1677752640000,
            meta: {
              surface: "web://mywebsite.com/my-cards",
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
          schema: MESSAGE_CONTENT_CARD,
          data: {
            expiryDate: 1712190456,
            publishedDate: 1677839040000,

            meta: {
              surface: "web://mywebsite.com/my-cards",
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
      scope: "web://mywebsite.com/my-cards",
      scopeDetails: {
        decisionProvider: "AJO",
      },
    },
    {
      id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
      items: [
        {
          schema: MESSAGE_CONTENT_CARD,
          data: {
            expiryDate: 1712190456,
            publishedDate: 1678098240000,
            meta: {
              surface: "web://mywebsite.com/my-cards",
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
      scope: "web://mywebsite.com/my-cards",
      scopeDetails: {
        decisionProvider: "AJO",
      },
    },
    {
      id: "d1f7d411-a549-47bc-a4d8-c8e638b0a46b",
      items: [
        {
          schema: MESSAGE_CONTENT_CARD,
          data: {
            expiryDate: 1712190456,
            publishedDate: 1678184640000,
            meta: {
              surface: "web://mywebsite.com/my-cards",
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
      scope: "web://mywebsite.com/my-cards",
      scopeDetails: {
        decisionProvider: "AJO",
      },
    },
  ];

  beforeEach(() => {
    collect = jasmine.createSpy().and.returnValue(Promise.resolve());
    subscribeRulesetItems = createSubscribeRulesetItems({ collect });
  });

  it("has a command defined", () => {
    const { command } = subscribeRulesetItems;

    expect(command).toEqual({
      optionsValidator: jasmine.any(Function),
      run: jasmine.any(Function),
    });
  });

  it("calls the callback with list of content cards", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy("callback");

    // register a subscription.  equivalent to alloy("subscribeRulesetItems", ...
    command.run({
      surfaces: ["web://mywebsite.com/my-cards"],
      schemas: [MESSAGE_CONTENT_CARD],
      callback,
    });

    refresh(PROPOSITIONS);
    expect(callback).toHaveBeenCalledOnceWith(
      {
        propositions: [
          {
            id: "1a3d874f-39ee-4310-bfa9-6559a10041a4",
            items: [
              {
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1677752640000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1677839040000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
          {
            id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
            items: [
              {
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1678098240000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
          {
            id: "d1f7d411-a549-47bc-a4d8-c8e638b0a46b",
            items: [
              {
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1678184640000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
        ],
      },
      jasmine.any(Function),
    );
  });

  it("calls the callback with list of content cards at time of subscription (when there are existing propositions)", () => {
    const { command, refresh } = subscribeRulesetItems;
    refresh(PROPOSITIONS);

    const callback = jasmine.createSpy("callback");

    command.run({
      surfaces: ["web://mywebsite.com/my-cards"],
      schemas: [MESSAGE_CONTENT_CARD],
      callback,
    });

    expect(callback).toHaveBeenCalledOnceWith(
      {
        propositions: [
          {
            id: "1a3d874f-39ee-4310-bfa9-6559a10041a4",
            items: [
              {
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1677752640000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1677839040000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
          {
            id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
            items: [
              {
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1678098240000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
          {
            id: "d1f7d411-a549-47bc-a4d8-c8e638b0a46b",
            items: [
              {
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1678184640000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
        ],
      },
      jasmine.any(Function),
    );
  });

  it("calls the callback with list of dom action items", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    // register a subscription.  equivalent to alloy("subscribeRulesetItems", ...
    command.run({
      surfaces: ["web://mywebsite.com/my-cards"],
      schemas: [DOM_ACTION],
      callback,
    });

    refresh(PROPOSITIONS);
    expect(callback).toHaveBeenCalledOnceWith(
      {
        propositions: [
          {
            id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
            items: [
              {
                schema: "https://ns.adobe.com/personalization/dom-action",
                data: {
                  selector:
                    "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
        ],
      },
      jasmine.any(Function),
    );
  });

  it("calls the callback with list of dom action items at time of subscription (when there are existing propositions)", () => {
    const { command, refresh } = subscribeRulesetItems;
    refresh(PROPOSITIONS);

    const callback = jasmine.createSpy("callback");

    command.run({
      surfaces: ["web://mywebsite.com/my-cards"],
      schemas: [DOM_ACTION],
      callback,
    });

    expect(callback).toHaveBeenCalledOnceWith(
      {
        propositions: [
          {
            id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
            items: [
              {
                schema: "https://ns.adobe.com/personalization/dom-action",
                data: {
                  selector:
                    "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
        ],
      },
      jasmine.any(Function),
    );
  });

  it("calls the callback with list of all schema-based items for single schema", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    // register a subscription.  equivalent to alloy("subscribeRulesetItems", ...
    command.run({
      surfaces: ["web://mywebsite.com/my-cards"],
      callback,
    });

    refresh(PROPOSITIONS);
    expect(callback).toHaveBeenCalledOnceWith(
      {
        propositions: [
          {
            id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
            items: [
              {
                schema: "https://ns.adobe.com/personalization/dom-action",
                data: {
                  selector:
                    "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
          {
            id: "1a3d874f-39ee-4310-bfa9-6559a10041a4",
            items: [
              {
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1677752640000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1677839040000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
          {
            id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
            items: [
              {
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1678098240000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
          {
            id: "d1f7d411-a549-47bc-a4d8-c8e638b0a46b",
            items: [
              {
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1678184640000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
        ],
      },
      jasmine.any(Function),
    );
  });

  it("filters out all surfaces", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy("callback");

    // register a subscription.  equivalent to alloy("subscribeRulesetItems", ...
    command.run({
      surfaces: [],
      schemas: [MESSAGE_CONTENT_CARD],
      callback,
    });

    refresh(PROPOSITIONS);
    expect(callback).toHaveBeenCalledOnceWith(
      { propositions: [] },
      jasmine.any(Function),
    );
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
    expect(callback).toHaveBeenCalledOnceWith(
      {
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
      },
      jasmine.any(Function),
    );
  });

  it("returns all surfaces and schemas", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    // register a subscription.  equivalent to alloy("subscribeRulesetItems", ...
    command.run({
      callback,
    });

    refresh(PROPOSITIONS);
    expect(callback).toHaveBeenCalledOnceWith(
      {
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
                  selector:
                    "HTML > BODY > DIV.offer:eq(0) > IMG:nth-of-type(1)",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
          {
            id: "1a3d874f-39ee-4310-bfa9-6559a10041a4",
            items: [
              {
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1677752640000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1677839040000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
          {
            id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
            items: [
              {
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1678098240000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
          {
            id: "d1f7d411-a549-47bc-a4d8-c8e638b0a46b",
            items: [
              {
                schema:
                  "https://ns.adobe.com/personalization/message/content-card",
                data: {
                  expiryDate: 1712190456,
                  publishedDate: 1678184640000,
                  meta: {
                    surface: "web://mywebsite.com/my-cards",
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
            scope: "web://mywebsite.com/my-cards",
            scopeDetails: {
              decisionProvider: "AJO",
            },
          },
        ],
      },
      jasmine.any(Function),
    );
  });

  it("does not invoke callback if unsubscribed", async () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy("callback");

    // register a subscription.  equivalent to alloy("subscribeRulesetItems", ...
    const { unsubscribe } = await command.run({
      callback,
    });

    expect(unsubscribe instanceof Function).toBeTrue();
    unsubscribe();

    refresh(PROPOSITIONS);
    expect(callback).not.toHaveBeenCalled();
  });

  it("collects interact events", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const [{ propositions = [] }, collectEvent] = callback.calls.first().args;

    collectEvent(PropositionEventType.INTERACT, [propositions[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [
        {
          id: "abc",
          scope: "web://something.com",
          scopeDetails: { decisionProvider: "AJO" },
        },
      ],
      eventType: "decisioning.propositionInteract",
      documentMayUnload: true,
    });
  });

  it("collects only one interact event per proposition", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const [{ propositions = [] }, collectEvent] = callback.calls.first().args;

    collectEvent(PropositionEventType.INTERACT, [
      propositions[0],
      propositions[0],
      propositions[0],
    ]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [
        {
          id: "abc",
          scope: "web://something.com",
          scopeDetails: { decisionProvider: "AJO" },
        },
      ],
      eventType: "decisioning.propositionInteract",
      documentMayUnload: true,
    });
  });

  it("collects separate interact events for each distinct proposition", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const [{ propositions = [] }, collectEvent] = callback.calls.first().args;

    collectEvent(PropositionEventType.INTERACT, [propositions[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [
        {
          id: "abc",
          scope: "web://something.com",
          scopeDetails: { decisionProvider: "AJO" },
        },
      ],
      eventType: "decisioning.propositionInteract",
      documentMayUnload: true,
    });

    collectEvent(PropositionEventType.INTERACT, [propositions[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [
        {
          id: "abc",
          scope: "web://something.com",
          scopeDetails: { decisionProvider: "AJO" },
        },
      ],
      eventType: "decisioning.propositionInteract",
      documentMayUnload: true,
    });

    expect(collect).toHaveBeenCalledTimes(2);
  });

  it("collects multiple interact events for distinct propositions", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const [{ propositions = [] }, collectEvent] = callback.calls.first().args;

    collectEvent(PropositionEventType.INTERACT, [
      propositions[0],
      propositions[1],
    ]);

    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: [
        {
          id: "abc",
          scope: "web://something.com",
          scopeDetails: { decisionProvider: "AJO" },
        },
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          scope: "web://mywebsite.com/my-cards",
          scopeDetails: {
            decisionProvider: "AJO",
          },
        },
      ],
      eventType: "decisioning.propositionInteract",
      documentMayUnload: true,
    });
  });

  it("collects display events", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const [{ propositions = [] }, collectEvent] = callback.calls.first().args;

    collectEvent(PropositionEventType.DISPLAY, [propositions[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [
        {
          id: "abc",
          scope: "web://something.com",
          scopeDetails: { decisionProvider: "AJO" },
        },
      ],
      eventType: "decisioning.propositionDisplay",
      documentMayUnload: true,
    });
  });

  it("collects only one display event per proposition", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const [{ propositions = [] }, collectEvent] = callback.calls.first().args;

    collectEvent(PropositionEventType.DISPLAY, [propositions[0]]);
    collectEvent(PropositionEventType.DISPLAY, [
      propositions[0],
      propositions[0],
    ]);

    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: [
        {
          id: "abc",
          scope: "web://something.com",
          scopeDetails: { decisionProvider: "AJO" },
        },
      ],
      eventType: "decisioning.propositionDisplay",
      documentMayUnload: true,
    });
  });

  it("collects multiple display events for distinct propositions", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const [{ propositions = [] }, collectEvent] = callback.calls.first().args;

    collectEvent(PropositionEventType.DISPLAY, [
      propositions[0],
      propositions[1],
    ]);

    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: [
        {
          id: "abc",
          scope: "web://something.com",
          scopeDetails: { decisionProvider: "AJO" },
        },
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          scope: "web://mywebsite.com/my-cards",
          scopeDetails: {
            decisionProvider: "AJO",
          },
        },
      ],
      eventType: "decisioning.propositionDisplay",
      documentMayUnload: true,
    });
  });

  it("collects display events only once per session", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const [{ propositions = [] }, collectEvent] = callback.calls.first().args;

    collectEvent(PropositionEventType.DISPLAY, [
      propositions[0],
      propositions[1],
    ]);

    collectEvent(PropositionEventType.DISPLAY, [
      propositions[0],
      propositions[1],
    ]);

    collectEvent(PropositionEventType.DISPLAY, [propositions[2]]);

    expect(collect).toHaveBeenCalledTimes(2);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [
        {
          id: "abc",
          scope: "web://something.com",
          scopeDetails: { decisionProvider: "AJO" },
        },
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          scope: "web://mywebsite.com/my-cards",
          scopeDetails: {
            decisionProvider: "AJO",
          },
        },
      ],
      eventType: "decisioning.propositionDisplay",
      documentMayUnload: true,
    });

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [
        {
          id: "1a3d874f-39ee-4310-bfa9-6559a10041a4",
          scope: "web://mywebsite.com/my-cards",
          scopeDetails: { decisionProvider: "AJO" },
        },
      ],
      eventType: "decisioning.propositionDisplay",
      documentMayUnload: true,
    });
  });

  it("collects dismiss events", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const [{ propositions = [] }, collectEvent] = callback.calls.first().args;

    collectEvent(PropositionEventType.DISMISS, [propositions[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [
        {
          id: "abc",
          scope: "web://something.com",
          scopeDetails: { decisionProvider: "AJO" },
        },
      ],
      documentMayUnload: true,
      eventType: "decisioning.propositionDismiss",
    });
  });

  it("collects only one dismiss event per proposition", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const [{ propositions = [] }, collectEvent] = callback.calls.first().args;

    collectEvent(PropositionEventType.DISMISS, [
      propositions[0],
      propositions[0],
      propositions[0],
    ]);

    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: [
        {
          id: "abc",
          scope: "web://something.com",
          scopeDetails: { decisionProvider: "AJO" },
        },
      ],
      eventType: "decisioning.propositionDismiss",
      documentMayUnload: true,
    });
  });

  it("collects separate dismiss events for each distinct proposition", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const [{ propositions = [] }, collectEvent] = callback.calls.first().args;

    collectEvent(PropositionEventType.DISMISS, [propositions[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [
        {
          id: "abc",
          scope: "web://something.com",
          scopeDetails: { decisionProvider: "AJO" },
        },
      ],
      eventType: "decisioning.propositionDismiss",
      documentMayUnload: true,
    });

    collectEvent(PropositionEventType.DISMISS, [propositions[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [
        {
          id: "abc",
          scope: "web://something.com",
          scopeDetails: { decisionProvider: "AJO" },
        },
      ],
      eventType: "decisioning.propositionDismiss",
      documentMayUnload: true,
    });

    expect(collect).toHaveBeenCalledTimes(2);
  });

  it("collects multiple dismiss events for distinct propositions", () => {
    const { command, refresh } = subscribeRulesetItems;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const [{ propositions = [] }, collectEvent] = callback.calls.first().args;

    collectEvent(PropositionEventType.DISMISS, [
      propositions[0],
      propositions[1],
    ]);

    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: [
        {
          id: "abc",
          scope: "web://something.com",
          scopeDetails: { decisionProvider: "AJO" },
        },
        {
          id: "2e4c7b28-b3e7-4d5b-ae6a-9ab0b44af87e",
          scope: "web://mywebsite.com/my-cards",
          scopeDetails: {
            decisionProvider: "AJO",
          },
        },
      ],
      eventType: "decisioning.propositionDismiss",
      documentMayUnload: true,
    });
  });
});
