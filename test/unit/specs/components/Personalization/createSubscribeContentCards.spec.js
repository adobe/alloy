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
import createSubscribeContentCards from "../../../../../src/components/Personalization/createSubscribeContentCards.js";
import { MESSAGE_CONTENT_CARD } from "../../../../../src/constants/schema.js";

describe("Personalization:subscribeContentCards", () => {
  let collect;
  let subscribeContentCards;

  const PROPOSITIONS = [
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
            qualifiedDate: 1683042673387,
            displayedDate: 1683042673395,
          },
          id: "79129ecf-6430-4fbd-955a-b4f1dfdaa6fe",
        },
        {
          schema: "https://ns.adobe.com/personalization/dom-action",
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
            qualifiedDate: 1683042628064,
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
        id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
        scope: "web://mywebsite.com/my-cards",
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
    },
  ];

  beforeEach(() => {
    collect = jasmine.createSpy().and.returnValue(Promise.resolve());
    subscribeContentCards = createSubscribeContentCards({ collect });
  });

  it("has a command defined", () => {
    const { command } = subscribeContentCards;

    expect(command).toEqual({
      optionsValidator: jasmine.any(Function),
      run: jasmine.any(Function),
    });
  });

  it("calls the callback with list of items", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    // register a subscription.  equivalent to alloy("subscribeContentCards", {surface, callback})
    command.run({ surface: "web://mywebsite.com/my-cards", callback });
    expect(callback).not.toHaveBeenCalled();

    refresh(PROPOSITIONS);

    expect(callback).toHaveBeenCalledOnceWith({
      items: [
        jasmine.objectContaining({
          imageUrl: "img/twitter.png",
          actionTitle: "Shop the sale!",
          actionUrl: "https://luma.com/sale",
          publishedDate: 1678098240000,
          body: "Posting on social media helps us spread the word.",
          title: "Thanks for sharing!",
          qualifiedDate: 1683042658312,
          displayedDate: 1683042658316,
        }),
        jasmine.objectContaining({
          imageUrl: "img/gold-coin.jpg",
          actionTitle: "Shop the sale!",
          actionUrl: "https://luma.com/sale",
          publishedDate: 1678184640000,
          body: "Now you're ready to earn!",
          title: "Funds deposited!",
          qualifiedDate: 1683042653905,
          displayedDate: 1683042653909,
        }),
        jasmine.objectContaining({
          imageUrl: "img/achievement.png",
          actionTitle: "Shop the sale!",
          actionUrl: "https://luma.com/sale",
          publishedDate: 1677839040000,
          body: "Great job, you completed your profile.",
          title: "Achievement Unlocked!",
          qualifiedDate: 1683042628064,
          displayedDate: 1683042628070,
        }),
        jasmine.objectContaining({
          imageUrl: "img/lumon.png",
          actionTitle: "Shop the sale!",
          actionUrl: "https://luma.com/sale",
          publishedDate: 1677752640000,
          body: "a handshake is available upon request.",
          title: "Welcome to Lumon!",
          qualifiedDate: 1683042628064,
          displayedDate: 1683042628070,
        }),
      ],
      clicked: jasmine.any(Function),
      rendered: jasmine.any(Function),
      dismissed: jasmine.any(Function),
    });
  });

  it("does not call the callback when unsubscribed", async () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy("callback");

    // register a subscription.  equivalent to alloy("subscribeContentCards", {surface, callback})
    const { unsubscribe } = await command.run({
      surface: "web://mywebsite.com/my-cards",
      callback,
    });

    expect(unsubscribe instanceof Function).toBeTrue();
    unsubscribe();

    refresh(PROPOSITIONS);
    expect(callback).not.toHaveBeenCalled();
  });

  it("calls the callback with list of items at time of subscription (when there are existing propositions)", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    refresh(PROPOSITIONS);
    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    expect(callback).toHaveBeenCalledOnceWith({
      items: [
        jasmine.objectContaining({
          imageUrl: "img/twitter.png",
          actionTitle: "Shop the sale!",
          actionUrl: "https://luma.com/sale",
          publishedDate: 1678098240000,
          body: "Posting on social media helps us spread the word.",
          title: "Thanks for sharing!",
          qualifiedDate: 1683042658312,
          displayedDate: 1683042658316,
        }),
        jasmine.objectContaining({
          imageUrl: "img/gold-coin.jpg",
          actionTitle: "Shop the sale!",
          actionUrl: "https://luma.com/sale",
          publishedDate: 1678184640000,
          body: "Now you're ready to earn!",
          title: "Funds deposited!",
          qualifiedDate: 1683042653905,
          displayedDate: 1683042653909,
        }),
        jasmine.objectContaining({
          imageUrl: "img/achievement.png",
          actionTitle: "Shop the sale!",
          actionUrl: "https://luma.com/sale",
          publishedDate: 1677839040000,
          body: "Great job, you completed your profile.",
          title: "Achievement Unlocked!",
          qualifiedDate: 1683042628064,
          displayedDate: 1683042628070,
        }),
        jasmine.objectContaining({
          imageUrl: "img/lumon.png",
          actionTitle: "Shop the sale!",
          actionUrl: "https://luma.com/sale",
          publishedDate: 1677752640000,
          body: "a handshake is available upon request.",
          title: "Welcome to Lumon!",
          qualifiedDate: 1683042628064,
          displayedDate: 1683042628070,
        }),
      ],
      clicked: jasmine.any(Function),
      rendered: jasmine.any(Function),
      dismissed: jasmine.any(Function),
    });
  });

  it("calls the callback with most recent list of items at time of subscription", () => {
    const { command, refresh } = subscribeContentCards;

    const callbackA = jasmine.createSpy("callbackA");
    const callbackB = jasmine.createSpy("callbackB");

    refresh(PROPOSITIONS.slice(0, 2));
    command.run({
      surface: "web://mywebsite.com/my-cards",
      callback: callbackA,
    });

    refresh(PROPOSITIONS.slice(2));
    command.run({
      surface: "web://mywebsite.com/my-cards",
      callback: callbackB,
    });

    expect(callbackA).toHaveBeenCalledTimes(2);

    expect(callbackA).toHaveBeenCalledWith({
      items: [
        jasmine.objectContaining({
          imageUrl: "img/achievement.png",
          actionTitle: "Shop the sale!",
          actionUrl: "https://luma.com/sale",
          publishedDate: 1677839040000,
          body: "Great job, you completed your profile.",
          title: "Achievement Unlocked!",
          qualifiedDate: 1683042628064,
          displayedDate: 1683042628070,
        }),
        jasmine.objectContaining({
          imageUrl: "img/lumon.png",
          actionTitle: "Shop the sale!",
          actionUrl: "https://luma.com/sale",
          publishedDate: 1677752640000,
          body: "a handshake is available upon request.",
          title: "Welcome to Lumon!",
          qualifiedDate: 1683042628064,
          displayedDate: 1683042628070,
        }),
      ],
      clicked: jasmine.any(Function),
      rendered: jasmine.any(Function),
      dismissed: jasmine.any(Function),
    });

    expect(callbackA).toHaveBeenCalledWith({
      items: [
        jasmine.objectContaining({
          imageUrl: "img/twitter.png",
          actionTitle: "Shop the sale!",
          actionUrl: "https://luma.com/sale",
          publishedDate: 1678098240000,
          body: "Posting on social media helps us spread the word.",
          title: "Thanks for sharing!",
          qualifiedDate: 1683042658312,
          displayedDate: 1683042658316,
        }),
        jasmine.objectContaining({
          imageUrl: "img/gold-coin.jpg",
          actionTitle: "Shop the sale!",
          actionUrl: "https://luma.com/sale",
          publishedDate: 1678184640000,
          body: "Now you're ready to earn!",
          title: "Funds deposited!",
          qualifiedDate: 1683042653905,
          displayedDate: 1683042653909,
        }),
      ],
      clicked: jasmine.any(Function),
      rendered: jasmine.any(Function),
      dismissed: jasmine.any(Function),
    });

    expect(callbackB).toHaveBeenCalledOnceWith({
      items: [
        jasmine.objectContaining({
          imageUrl: "img/twitter.png",
          actionTitle: "Shop the sale!",
          actionUrl: "https://luma.com/sale",
          publishedDate: 1678098240000,
          body: "Posting on social media helps us spread the word.",
          title: "Thanks for sharing!",
          qualifiedDate: 1683042658312,
          displayedDate: 1683042658316,
        }),
        jasmine.objectContaining({
          imageUrl: "img/gold-coin.jpg",
          actionTitle: "Shop the sale!",
          actionUrl: "https://luma.com/sale",
          publishedDate: 1678184640000,
          body: "Now you're ready to earn!",
          title: "Funds deposited!",
          qualifiedDate: 1683042653905,
          displayedDate: 1683042653909,
        }),
      ],
      clicked: jasmine.any(Function),
      rendered: jasmine.any(Function),
      dismissed: jasmine.any(Function),
    });
  });

  it("has helper methods on items", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const { items } = callback.calls.first().args[0];

    expect(items[0].getSurface).toEqual(jasmine.any(Function));
    expect(items[0].getAnalyticsDetail).toEqual(jasmine.any(Function));

    expect(items[0].getSurface()).toEqual("web://mywebsite.com/my-cards");
    expect(items[0].getAnalyticsDetail()).toEqual({
      id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
      scope: "web://mywebsite.com/my-cards",
      scopeDetails: {
        id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
        scope: "web://mywebsite.com/my-cards",
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
    });
  });

  it("collects interact events", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const { items, clicked } = callback.calls.first().args[0];

    clicked([items[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [items[0].getAnalyticsDetail()],
      eventType: "decisioning.propositionInteract",
      documentMayUnload: true,
    });
  });

  it("collects only one interact event per proposition", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const { items, clicked } = callback.calls.first().args[0];

    clicked([items[0], items[0], items[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [items[0].getAnalyticsDetail()],
      eventType: "decisioning.propositionInteract",
      documentMayUnload: true,
    });
  });

  it("collects separate interact events for each distinct proposition", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const { items, clicked } = callback.calls.first().args[0];

    clicked([items[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [items[0].getAnalyticsDetail()],
      eventType: "decisioning.propositionInteract",
      documentMayUnload: true,
    });

    clicked([items[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [items[0].getAnalyticsDetail()],
      eventType: "decisioning.propositionInteract",
      documentMayUnload: true,
    });

    expect(collect).toHaveBeenCalledTimes(2);
  });

  it("collects multiple interact events for distinct propositions", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const { items, clicked } = callback.calls.first().args[0];

    clicked([items[0], items[1]]);

    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: [
        items[0].getAnalyticsDetail(),
        items[1].getAnalyticsDetail(),
      ],
      eventType: "decisioning.propositionInteract",
      documentMayUnload: true,
    });
  });

  it("collects display events", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const { items, rendered } = callback.calls.first().args[0];

    rendered([items[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [items[0].getAnalyticsDetail()],
      eventType: "decisioning.propositionDisplay",
    });
  });

  it("collects only one display event per proposition", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const { items, rendered } = callback.calls.first().args[0];

    rendered([items[0]]);
    rendered([items[0], items[0]]);

    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: [items[0].getAnalyticsDetail()],
      eventType: "decisioning.propositionDisplay",
    });
  });

  it("collects multiple display events for distinct propositions", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const { items, rendered } = callback.calls.first().args[0];

    rendered([items[0], items[1]]);

    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: [
        items[0].getAnalyticsDetail(),
        items[1].getAnalyticsDetail(),
      ],
      eventType: "decisioning.propositionDisplay",
    });
  });

  it("collects display events only once per session", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const { items, rendered } = callback.calls.first().args[0];

    rendered([items[0], items[1]]);
    rendered([items[0], items[1]]);
    rendered([items[2]]);

    expect(collect).toHaveBeenCalledTimes(2);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [
        items[0].getAnalyticsDetail(),
        items[1].getAnalyticsDetail(),
      ],
      eventType: "decisioning.propositionDisplay",
    });

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [items[2].getAnalyticsDetail()],
      eventType: "decisioning.propositionDisplay",
    });
  });

  it("collects dismiss events", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const { items, dismissed } = callback.calls.first().args[0];

    dismissed([items[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [items[0].getAnalyticsDetail()],
      documentMayUnload: true,
      eventType: "decisioning.propositionDismiss",
    });
  });

  it("collects only one dismiss event per proposition", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const { items, dismissed } = callback.calls.first().args[0];

    dismissed([items[0], items[0], items[0]]);

    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: [items[0].getAnalyticsDetail()],
      eventType: "decisioning.propositionDismiss",
      documentMayUnload: true,
    });
  });

  it("collects separate dismiss events for each distinct proposition", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const { items, dismissed } = callback.calls.first().args[0];

    dismissed([items[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [items[0].getAnalyticsDetail()],
      eventType: "decisioning.propositionDismiss",
      documentMayUnload: true,
    });

    dismissed([items[0]]);

    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: [items[0].getAnalyticsDetail()],
      eventType: "decisioning.propositionDismiss",
      documentMayUnload: true,
    });

    expect(collect).toHaveBeenCalledTimes(2);
  });

  it("collects multiple dismiss events for distinct propositions", () => {
    const { command, refresh } = subscribeContentCards;

    const callback = jasmine.createSpy();

    command.run({ surface: "web://mywebsite.com/my-cards", callback });

    refresh(PROPOSITIONS);

    const { items, dismissed } = callback.calls.first().args[0];

    dismissed([items[0], items[1]]);

    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: [
        items[0].getAnalyticsDetail(),
        items[1].getAnalyticsDetail(),
      ],
      eventType: "decisioning.propositionDismiss",
      documentMayUnload: true,
    });
  });
});
