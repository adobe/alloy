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
import { ClientFunction, t } from "testcafe";
import uuid from "../../../../src/utils/uuid.js";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import getBaseConfig from "../../helpers/getBaseConfig.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody.js";
import { ADOBE_JOURNEY_OPTIMIZER } from "../../../../src/constants/decisionProvider.js";
import { responseStatus } from "../../helpers/assertions/index.js";

const REASONABLE_WAIT_TIME = 250;

const networkLogger = createNetworkLogger();
const { edgeEndpointLogs } = networkLogger;

const orgId = "97D1F3F459CE0AD80A495CBE@AdobeOrg";

const orgMainConfigMain = getBaseConfig(
  orgId,
  "0a106b4d-1937-4196-a64d-4a324e972459",
);
const config = compose(orgMainConfigMain, debugEnabled, {
  personalizationStorageEnabled: true,
});

test.meta({
  ID: "C1234567",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

createFixture({
  title: "C1234567 - Content Cards",
  url: `${TEST_PAGE_URL}?test=C17409728`,
  requestHooks: [edgeEndpointLogs],
});

const testPageBody = `
<h1 id="page-header">Content Cards</h1>
<ul id="content-cards"></ul>
`;

const createMockResponse = ({
  scope = "web://aepdemo.com/",
  propositionId = uuid(),
  activityId = uuid(),
  decisionProvider = ADOBE_JOURNEY_OPTIMIZER,
  items = [],
}) => {
  return {
    requestId: uuid(),
    handle: [
      {
        payload: [
          {
            id: "54671057599843051332294448941462242513",
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
            id: propositionId,
            scope,
            scopeDetails: {
              decisionProvider,
              correlationID: "6dae465b-9553-4fc6-b7d4-6c9979c88f21-0",
              characteristics: {
                eventToken:
                  "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6IlVFOkluYm91bmQiLCJtZXNzYWdlSUQiOiJmMzgxZWJhYS1kNDIyLTQxNzQtOWUzNS0yMTY3NDYwMjk5MTAiLCJtZXNzYWdlUHVibGljYXRpb25JRCI6IjZkYWU0NjViLTk1NTMtNGZjNi1iN2Q0LTZjOTk3OWM4OGYyMSIsIm1lc3NhZ2VUeXBlIjoibWFya2V0aW5nIiwiY2FtcGFpZ25JRCI6ImVhZDg5MWE0LTNjYWUtNGE1ZC05MGEzLTFkZTc0MzkwYjNkMyIsImNhbXBhaWduVmVyc2lvbklEIjoiZDhiYzk5YmMtZGRhZC00Y2MyLThlYjItYTJlMGUzY2FmNzg0IiwiY2FtcGFpZ25BY3Rpb25JRCI6IjQzNmZmM2NkLTZkZWItNDczNi04NDc1LTA3NDhhYzc4MTlkOCJ9LCJtZXNzYWdlUHJvZmlsZSI6eyJtZXNzYWdlUHJvZmlsZUlEIjoiMDg5NGYwNmYtOTkyNi00YTc2LTk4OTktYThmZjc3NWZmNTA4IiwiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvd2ViIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy93ZWIifX19",
              },
              activity: {
                id: activityId,
              },
            },
            items: [...items],
          },
        ],
        type: "personalization:decisions",
        eventIndex: 0,
      },
    ],
  };
};

const getHistoricEventFromLocalStorage = ClientFunction(
  (organizationId, activityId, eventType) => {
    const key = `com.adobe.alloy.${organizationId.split("@")[0]}_AdobeOrg.decisioning.events`;
    const data = JSON.parse(localStorage.getItem(key));

    const event = data[eventType] || {};
    return event[activityId];
  },
);

test("Test C1234567: Subscribes content cards", async () => {
  const surface = "web://mywebsite.com/#my-cards";

  const publishedDate = Math.ceil(new Date().getTime() / 1000) - 864000;
  const expiryDate = Math.ceil(new Date().getTime() / 1000) + 864000;

  const activityId = uuid();
  const propositionId = uuid();
  const itemId = uuid();

  const responseBody = createMockResponse({
    scope: surface,
    activityId,
    propositionId,
    items: [
      {
        id: itemId,
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
                        key: "~timestampu",
                        matcher: "le",
                        values: [expiryDate],
                      },
                      type: "matcher",
                    },
                    {
                      definition: {
                        conditions: [
                          {
                            definition: {
                              events: [
                                {
                                  "iam.eventType": "trigger",
                                  "iam.id": activityId,
                                },
                              ],
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
                      expiryDate,
                      publishedDate,
                      meta: {
                        surface,
                      },
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
                    id: itemId,
                  },
                  id: itemId,
                },
              ],
            },
          ],
        },
      },
    ],
  });

  await addHtmlToBody(testPageBody, true);

  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.applyResponse({
    renderDecisions: true,
    responseBody,
  });

  await alloy.subscribeContentCards({
    surface,
    // eslint-disable-next-line no-unused-vars
    callback: ({ items = [], rendered, clicked, dismissed }) => {
      const ul = document.getElementById("content-cards");
      let html = "";
      items.forEach((item, idx) => {
        html += `<li id="content-card-${idx}" data-idx="${idx}"><img src=${item.imageUrl} alt="Item Image" /><h6>${item.title}</h6><p>${item.body}</p></li>`;
      });
      ul.innerHTML = html;

      rendered(items);

      ul.addEventListener("click", (evt) => {
        const li = evt.target.closest("li");

        clicked([items[li.dataset.idx]]);
      });
    },
  });

  await alloy.evaluateRulesets({
    renderDecisions: true,
    personalization: {
      decisionContext: {
        action: "deposit-funds",
      },
    },
  });

  const trigger = await getHistoricEventFromLocalStorage(
    orgId,
    activityId,
    "trigger",
  );

  await t.expect(trigger.count).eql(1);

  // validate display event sent
  await responseStatus(edgeEndpointLogs.requests, [200, 204]);
  await t.expect(edgeEndpointLogs.count(() => true)).eql(1);

  const display = await getHistoricEventFromLocalStorage(
    orgId,
    activityId,
    "display",
  );

  await t.expect(display.count).eql(1);

  await t.click("#content-card-0");
  await t.wait(REASONABLE_WAIT_TIME);

  const interact = await getHistoricEventFromLocalStorage(
    orgId,
    activityId,
    "interact",
  );

  await t.expect(interact.count).eql(1);

  // validate interact event sent
  await responseStatus(edgeEndpointLogs.requests, [200, 204]);
  await t.expect(edgeEndpointLogs.count(() => true)).eql(2);
});
