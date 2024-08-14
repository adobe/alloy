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
import createOnDecisionHandler from "../../../../../src/components/Personalization/createOnDecisionHandler.js";
import { MESSAGE_CONTENT_CARD } from "../../../../../src/constants/schema.js";
import injectCreateProposition from "../../../../../src/components/Personalization/handlers/injectCreateProposition.js";
import createNotificationHandler from "../../../../../src/components/Personalization/createNotificationHandler.js";

describe("Personalization::createOnDecisionHandler", () => {
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
  let render;
  let collect;
  let processPropositions;
  let createProposition;
  let onDecisionHandler;
  let renderedPropositions;
  let notificationHandler;

  beforeEach(() => {
    render = jasmine
      .createSpy("render")
      .and.returnValue(Promise.resolve([{ hi: true }]));
    collect = jasmine.createSpy("collect").and.returnValue(Promise.resolve());
    processPropositions = jasmine
      .createSpy("processPropositions")
      .and.returnValue({ render, returnedPropositions: PROPOSITIONS });

    createProposition = injectCreateProposition({
      preprocess: (data) => data,
      isPageWideSurface: () => false,
    });

    renderedPropositions = jasmine.createSpyObj("renderedPropositions", [
      "concat",
    ]);

    notificationHandler = createNotificationHandler(
      collect,
      renderedPropositions,
    );

    onDecisionHandler = createOnDecisionHandler({
      processPropositions,
      createProposition,
      notificationHandler,
    });
  });

  it("does not call render if renderDecisions=false", () => {
    onDecisionHandler({
      viewName: "blippi",
      renderDecisions: false,
      propositions: PROPOSITIONS,
    });

    expect(render).not.toHaveBeenCalled();
  });

  it("calls render if renderDecisions=true", async () => {
    const mockEvent = { getViewName: () => "blippi" };
    const { propositions } = await onDecisionHandler({
      event: mockEvent,
      personalization: {},
      renderDecisions: true,
      propositions: PROPOSITIONS,
    });

    expect(propositions).toEqual(PROPOSITIONS);

    expect(render).toHaveBeenCalledTimes(1);

    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: [{ hi: true }],
      viewName: "blippi",
    });
    expect(renderedPropositions.concat).not.toHaveBeenCalled();
  });

  it("defers sending display notification when sendDisplayEvent=false", async () => {
    await onDecisionHandler({
      renderDecisions: true,
      propositions: PROPOSITIONS,
      event: { getViewName: () => "blippi" },
      personalization: {
        sendDisplayEvent: false,
      },
    });

    expect(collect).not.toHaveBeenCalled();
    expect(renderedPropositions.concat).toHaveBeenCalledTimes(1);
  });
});
