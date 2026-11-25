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

import { http, HttpResponse } from "msw";
import alloyConfig from "../../helpers/alloy/config.js";
import { test, expect } from "../../helpers/testsSetup/extend.js";

const edgeUrl = /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/;

test("C21886916: tracks a link click inside an open shadow root", async ({
  alloy,
  worker,
  networkRecorder,
}) => {
  worker.use(
    http.post(edgeUrl, () =>
      HttpResponse.json({ requestId: "shadow-click", handle: [] }),
    ),
  );
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML =
    '<div><a id="shadow-dom-link-test" href="#">open shadow dom link</a></div>';

  try {
    await alloy("configure", { ...alloyConfig, clickCollectionEnabled: true });
    expect(
      networkRecorder.calls.filter((call) => edgeUrl.test(call.url)),
    ).toHaveLength(0);

    const link = root.querySelector("#shadow-dom-link-test");
    link.addEventListener("click", (event) => event.preventDefault());
    link.click();

    const calls = await networkRecorder.findCalls(edgeUrl, {
      retries: 30,
      delayMs: 100,
      minCalls: 1,
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].request.body.events[0].xdm.web.webInteraction.name).toBe(
      "open shadow dom link",
    );
  } finally {
    host.remove();
  }
});

test("C21886916: tracks a personalized link inside an open shadow root", async ({
  alloy,
  worker,
  networkRecorder,
}) => {
  worker.use(
    http.post(edgeUrl, () =>
      HttpResponse.json({ requestId: "shadow-interaction", handle: [] }),
    ),
  );
  const host = document.createElement("div");
  host.id = "shadow-link-host";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = '<div id="shadow-link-target"></div>';
  document.body.appendChild(host);

  try {
    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      autoCollectPropositionInteractions: { AJO: "always" },
    });
    await alloy("applyResponse", {
      renderDecisions: true,
      responseBody: {
        requestId: "shadow-link-offer",
        handle: [
          {
            type: "personalization:decisions",
            eventIndex: 0,
            payload: [
              {
                id: "shadow-link-proposition",
                scope: "web://aepdemo.com/",
                scopeDetails: {
                  decisionProvider: "AJO",
                  activity: { id: "shadow-link-activity" },
                  correlationID: "shadow-link:0:0",
                  characteristics: { eventToken: "shadow-link-token" },
                },
                items: [
                  {
                    id: "shadow-link-item",
                    schema: "https://ns.adobe.com/personalization/dom-action",
                    data: {
                      type: "setHtml",
                      selector:
                        "#shadow-link-host:shadow > #shadow-link-target",
                      content: '<a href="#">open shadow dom link</a>',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    });
    const display = await networkRecorder.waitForCall(edgeUrl);
    expect(display.request.body.events[0].xdm.eventType).toBe(
      "decisioning.propositionDisplay",
    );
    networkRecorder.reset();

    const link = root.querySelector("a");
    expect(link).not.toBeNull();
    link.addEventListener("click", (event) => event.preventDefault());
    link.click();
    const call = await networkRecorder.waitForCall(edgeUrl);
    expect(call).toBeDefined();
    const event = call.request.body.events[0].xdm;
    expect(event.web.webInteraction.name).toBe("open shadow dom link");
    expect(event.eventType).toBe("decisioning.propositionInteract");
    expect(event._experience.decisioning.propositions).toEqual([
      expect.objectContaining({
        id: "shadow-link-proposition",
        items: [{ id: "shadow-link-item" }],
      }),
    ]);
  } finally {
    host.remove();
  }
});

test("C28758: renders VEC offers into simple and nested shadow roots", async ({
  alloy,
  worker,
  networkRecorder,
}) => {
  const form = document.createElement("form");
  form.id = "form";
  form.innerHTML = `
    <buy-now-button>FirstButton</buy-now-button>
    <buy-now-button>SecondButton</buy-now-button>
    <product-order>FirstOrder</product-order>
    <product-order>SecondOrder</product-order>
    <input type="submit" value="Submit" />
  `;
  const buttonContent = `
    <div>
      <input type="radio" id="buy" name="buy_btn" value="Buy NOW" />
      <label for="buy">Buy Now</label><br />
      <div>
        <input type="radio" id="buy_later" name="buy_btn_ltr" value="Buy LATER" />
        <label for="buy_later">Buy Later</label><br />
      </div>
    </div>
  `;
  form.querySelectorAll("buy-now-button").forEach((button) => {
    button.attachShadow({ mode: "open" }).innerHTML = buttonContent;
  });
  form.querySelectorAll("product-order").forEach((order) => {
    const root = order.attachShadow({ mode: "open" });
    root.innerHTML =
      "<div><p>Product order</p><buy-now-button>Buy</buy-now-button></div>";
    root
      .querySelector("buy-now-button")
      .attachShadow({ mode: "open" }).innerHTML = buttonContent;
  });
  document.body.appendChild(form);

  const items = [
    {
      id: "simple-shadow-item",
      selector:
        "#form > buy-now-button:nth-of-type(2):shadow > div > div > label",
      content: "Simple Shadow offer!",
    },
    {
      id: "nested-shadow-item",
      selector:
        "#form > product-order:nth-of-type(2):shadow > div > buy-now-button:shadow > div > label",
      content: "Nested Shadow offer!",
    },
  ].map(({ id, selector, content }) => ({
    id,
    schema: "https://ns.adobe.com/personalization/dom-action",
    data: {
      type: "setHtml",
      format: "application/vnd.adobe.target.dom-action",
      selector,
      content,
    },
  }));

  worker.use(
    http.post(edgeUrl, async ({ request }) => {
      const body = await request.json();
      if (!body.events[0].query?.personalization?.schemas) {
        return HttpResponse.json({
          requestId: "shadow-notification",
          handle: [],
        });
      }
      return HttpResponse.json({
        requestId: "shadow-offers",
        handle: [
          {
            type: "personalization:decisions",
            eventIndex: 0,
            payload: [
              {
                id: "AT:shadow-offer",
                scope: "__view__",
                scopeDetails: {
                  decisionProvider: "TGT",
                  activity: { id: "shadow-activity" },
                  experience: { id: "0" },
                  characteristics: { eventToken: "shadow-token" },
                  correlationID: "shadow:0:0",
                },
                items,
              },
            ],
          },
        ],
      });
    }),
  );

  try {
    await alloy("configure", alloyConfig);
    const result = await alloy("sendEvent", { renderDecisions: true });
    const calls = await networkRecorder.findCalls(edgeUrl, {
      retries: 30,
      delayMs: 100,
      minCalls: 2,
    });
    expect(calls).toHaveLength(2);
    expect(calls.map(({ response }) => response.status)).toEqual([200, 200]);
    const query = calls[0].request.body.events[0].query.personalization;
    expect(query.decisionScopes).toEqual(["__view__"]);
    expect(calls[0].response.body.handle[0].payload[0].scope).toBe("__view__");
    expect(query.schemas).toEqual(
      expect.arrayContaining([
        "https://ns.adobe.com/personalization/default-content-item",
        "https://ns.adobe.com/personalization/dom-action",
        "https://ns.adobe.com/personalization/html-content-item",
        "https://ns.adobe.com/personalization/json-content-item",
        "https://ns.adobe.com/personalization/redirect-item",
      ]),
    );
    expect(
      form.children[1].shadowRoot.querySelectorAll("label")[1].innerText,
    ).toBe("Simple Shadow offer!");
    const nestedRoot =
      form.children[3].shadowRoot.querySelector("buy-now-button").shadowRoot;
    expect(nestedRoot.querySelector("label").innerText).toBe(
      "Nested Shadow offer!",
    );
    expect(
      result.decisions.filter((decision) =>
        decision.items.some((item) =>
          [
            "https://ns.adobe.com/personalization/dom-action",
            "https://ns.adobe.com/personalization/html-content-item",
          ].includes(item.schema),
        ),
      ),
    ).toHaveLength(0);
    expect(
      result.propositions.some((proposition) => proposition.renderAttempted),
    ).toBe(true);
  } finally {
    form.remove();
  }
});
