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
import createRedirectHandler from "../../../../../../src/components/Personalization/handlers/createRedirectHandler";
import { createProposition } from "../../../../../../src/components/Personalization/handlers/proposition";

describe("redirectHandler", () => {
  let next;
  let redirectHandler;

  beforeEach(() => {
    next = jasmine.createSpy("next");
    redirectHandler = createRedirectHandler({ next });
  });

  it("works with real response", () => {
    const handle = {
      id: "AT:eyJhY3Rpdml0eUlkIjoiMTI3ODE5IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
      scope: "__view__",
      scopeDetails: {
        decisionProvider: "TGT",
        activity: {
          id: "127819"
        },
        experience: {
          id: "0"
        },
        strategies: [
          {
            algorithmID: "0",
            trafficType: "0"
          }
        ],
        characteristics: {
          eventToken:
            "8CwxglIqrTLmqP2m1r52VWqipfsIHvVzTQxHolz2IpTMromRrB5ztP5VMxjHbs7c6qPG9UF4rvQTJZniWgqbOw=="
        }
      },
      items: [
        {
          id: "0",
          schema: "https://ns.adobe.com/personalization/redirect-item",
          meta: {
            "experience.id": "0",
            "activity.id": "127819",
            "offer.name": "Default Content",
            "activity.name": "Functional:C205528",
            "offer.id": "0"
          },
          data: {
            type: "redirect",
            format: "text/uri-list",
            content:
              "https://alloyio.com/functional-test/alloyTestPage.html?redirectedTest=true&test=C205528"
          }
        }
      ]
    };
    const proposition = createProposition(handle);
    redirectHandler(proposition);
    expect(next).not.toHaveBeenCalled();
    expect(proposition.getRedirectUrl()).toEqual(
      "https://alloyio.com/functional-test/alloyTestPage.html?redirectedTest=true&test=C205528"
    );

    const propositions = [];
    proposition.addToReturnedPropositions(propositions);
    expect(propositions.length).toEqual(1);
    expect(propositions[0].renderAttempted).toBeTrue();
    expect(propositions[0].id).toEqual(
      "AT:eyJhY3Rpdml0eUlkIjoiMTI3ODE5IiwiZXhwZXJpZW5jZUlkIjoiMCJ9"
    );

    const notifications = [];
    proposition.addToNotifications(notifications);
    expect(notifications.length).toEqual(1);
    expect(notifications[0].id).toEqual(
      "AT:eyJhY3Rpdml0eUlkIjoiMTI3ODE5IiwiZXhwZXJpZW5jZUlkIjoiMCJ9"
    );
  });

  it("passes through non-redirect propositions", () => {
    const handle = {
      id: "AT:eyJhY3Rpdml0eUlkIjoiMTI3ODE5IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
      scope: "__view__",
      scopeDetails: {
        decisionProvider: "TGT",
        activity: {
          id: "127819"
        },
        experience: {
          id: "0"
        },
        strategies: [
          {
            algorithmID: "0",
            trafficType: "0"
          }
        ],
        characteristics: {
          eventToken:
            "8CwxglIqrTLmqP2m1r52VWqipfsIHvVzTQxHolz2IpTMromRrB5ztP5VMxjHbs7c6qPG9UF4rvQTJZniWgqbOw=="
        }
      },
      items: [
        {
          id: "0",
          schema: "https://ns.adobe.com/personalization/html-content-item",
          meta: {
            "experience.id": "0",
            "activity.id": "127819",
            "offer.name": "Default Content",
            "activity.name": "Functional:C205528",
            "offer.id": "0"
          },
          data: {
            type: "html",
            format: "text/html",
            content: "<p>Some custom content for the home page</p>"
          }
        }
      ]
    };
    const proposition = createProposition(handle);
    redirectHandler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
    expect(proposition.getRedirectUrl()).toBeUndefined();
  });
});
