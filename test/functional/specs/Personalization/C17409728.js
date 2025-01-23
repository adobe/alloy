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
import { Selector, t } from "testcafe";
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
import {
  CLICK_LABEL_DATA_ATTRIBUTE,
  INTERACT_ID_DATA_ATTRIBUTE,
} from "../../../../src/components/Personalization/handlers/createDecorateProposition.js";
import { ADOBE_JOURNEY_OPTIMIZER } from "../../../../src/constants/decisionProvider.js";
import {
  ALWAYS,
  DECORATED_ELEMENTS_ONLY,
  NEVER,
} from "../../../../src/constants/propositionInteractionType.js";
import { DOM_ACTION_COLLECT_INTERACTIONS } from "../../../../src/components/Personalization/dom-actions/initDomActionsModules.js";
import { responseStatus } from "../../helpers/assertions/index.js";

const REASONABLE_WAIT_TIME = 250;

const networkLogger = createNetworkLogger();
const { edgeEndpointLogs } = networkLogger;

const orgMainConfigMain = getBaseConfig(
  "97D1F3F459CE0AD80A495CBE@AdobeOrg",
  "0a106b4d-1937-4196-a64d-4a324e972459",
);
let config;

test.meta({
  ID: "C17409728",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

createFixture({
  title: "C17409728 - Proposition interactions are automatically tracked",
  url: `${TEST_PAGE_URL}?test=C17409728`,
  requestHooks: [edgeEndpointLogs],
});

const testPageBody = `
<h1 id="page-header">Hello World!</h1>
`;

const createMockResponse = ({
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
            scope: "web://aepdemo.com/",
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

test("Test C17409728: Automatically sends interact event for proposition click", async () => {
  config = compose(orgMainConfigMain, debugEnabled, {
    autoCollectPropositionInteractions: {
      [ADOBE_JOURNEY_OPTIMIZER]: ALWAYS,
    },
  });

  const propositionId = uuid();
  const itemId = uuid();
  const responseBody = createMockResponse({
    propositionId,
    items: [
      {
        id: itemId,
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "insertBefore",
          content: '<div id="something">This is something</div>',
          selector: "#page-header",
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

  await t
    .expect(
      Selector("#something").withAttribute(INTERACT_ID_DATA_ATTRIBUTE).exists,
    )
    .ok();

  edgeEndpointLogs.clear();
  await t.click("#something");

  await responseStatus(edgeEndpointLogs.requests, [200, 204]);
  await t.expect(edgeEndpointLogs.count(() => true)).eql(1);

  // TODO: Testcafe no longer captures the request body for sendBeacon requests.
  // const notification = JSON.parse(edgeEndpointLogs.requests[0].request.body);
  //
  // await t.expect(notification.events[0].xdm.eventType).eql(INTERACT);
  //
  // await t
  //   .expect(
  //     notification.events[0].xdm._experience.decisioning.propositions[0].id,
  //   )
  //   .eql(propositionId);
  //
  // await t
  //   .expect(
  //     notification.events[0].xdm._experience.decisioning.propositions[0]
  //       .items[0].id,
  //   )
  //   .eql(itemId);
});

test("Test C17409728: Does not automatically send interact event for proposition click when autoCollectPropositionInteractions configured to 'never'", async () => {
  config = compose(orgMainConfigMain, debugEnabled, {
    autoCollectPropositionInteractions: {
      [ADOBE_JOURNEY_OPTIMIZER]: NEVER,
    },
  });

  const propositionId = uuid();
  const itemId = uuid();
  const responseBody = createMockResponse({
    propositionId,
    items: [
      {
        id: itemId,
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "insertAfter",
          content: '<div id="something-else">This is something else</div>',
          selector: "#page-header",
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

  await t
    .expect(
      Selector("#something-else").withAttribute(INTERACT_ID_DATA_ATTRIBUTE)
        .exists,
    )
    .notOk();

  edgeEndpointLogs.clear();

  await t.click("#something-else");
  await t.wait(REASONABLE_WAIT_TIME);

  await t.expect(edgeEndpointLogs.count(() => true)).eql(0);
});

test("Test C17409728: Automatically sends interact event for proposition click when autoCollectPropositionInteractions configured to 'decoratedElementsOnly'", async () => {
  config = compose(orgMainConfigMain, debugEnabled, {
    autoCollectPropositionInteractions: {
      [ADOBE_JOURNEY_OPTIMIZER]: DECORATED_ELEMENTS_ONLY,
    },
  });

  const propositionId = uuid();
  const itemId = uuid();
  const responseBody = createMockResponse({
    propositionId,
    items: [
      {
        id: itemId,
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "insertAfter",
          content: `<ul id="some-list">
                      <li id="some-list-item-a">one</li>
                      <li id="some-list-item-b">two</li>
                      <li id="some-list-item-c">three <span id="some-list-item-span" ${CLICK_LABEL_DATA_ATTRIBUTE}="click-me-here">yippie</span></li>
                    </ul>`,
          selector: "#page-header",
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

  await t
    .expect(
      Selector("#some-list").withAttribute(INTERACT_ID_DATA_ATTRIBUTE).exists,
    )
    .ok();

  edgeEndpointLogs.clear();

  await t.click("#some-list-item-a");

  await responseStatus(edgeEndpointLogs.requests, [200, 204]);
  await t.expect(edgeEndpointLogs.count(() => true)).eql(0);

  await t.click("#some-list-item-span");

  await responseStatus(edgeEndpointLogs.requests, [200, 204]);
  await t.expect(edgeEndpointLogs.count(() => true)).eql(1);

  // TODO: Testcafe no longer captures the request body for sendBeacon requests.
  // const notification = JSON.parse(edgeEndpointLogs.requests[0].request.body);
  //
  // await t.expect(notification.events[0].xdm.eventType).eql(INTERACT);
  //
  // await t
  //   .expect(
  //     notification.events[0].xdm._experience.decisioning.propositions[0].id,
  //   )
  //   .eql(propositionId);
  //
  // await t
  //   .expect(
  //     notification.events[0].xdm._experience.decisioning.propositions[0]
  //       .items[0].id,
  //   )
  //   .eql(itemId);
});

test("Test C17409728: Automatically sends interact event when using applyPropositions command", async () => {
  config = compose(orgMainConfigMain, debugEnabled, {
    autoCollectPropositionInteractions: {
      [ADOBE_JOURNEY_OPTIMIZER]: ALWAYS,
    },
  });

  const propositionId = uuid();
  const itemId = uuid();
  const responseBody = createMockResponse({
    propositionId,
    items: [
      {
        id: itemId,
        schema: "https://ns.adobe.com/personalization/json-content-item",
        data: {
          content: {
            favoriteColor: "orange",
            preferredCrypto: "BTC",
          },
        },
      },
    ],
  });

  await addHtmlToBody(testPageBody, true);

  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const { propositions = [] } = await alloy.applyResponse({
    renderDecisions: false,
    responseBody,
  });

  await alloy.applyPropositions({
    propositions,
    metadata: {
      "web://aepdemo.com/": {
        selector: "#page-header",
        actionType: DOM_ACTION_COLLECT_INTERACTIONS,
      },
    },
  });

  await t
    .expect(
      Selector("#page-header").withAttribute(INTERACT_ID_DATA_ATTRIBUTE).exists,
    )
    .ok();

  edgeEndpointLogs.clear();

  await t.click("#page-header");

  await responseStatus(edgeEndpointLogs.requests, [200, 204, 207]);
  await t.expect(edgeEndpointLogs.count(() => true)).eql(1);

  // TODO: Testcafe no longer captures the request body for sendBeacon requests.
  // const notification = JSON.parse(edgeEndpointLogs.requests[0].request.body);
  //
  // await t.expect(notification.events[0].xdm.eventType).eql(INTERACT);
  //
  // await t
  //   .expect(
  //     notification.events[0].xdm._experience.decisioning.propositions[0].id,
  //   )
  //   .eql(propositionId);
  //
  // await t
  //   .expect(
  //     notification.events[0].xdm._experience.decisioning.propositions[0]
  //       .items[0].id,
  //   )
  //   .eql(itemId);
});

test("Test C17409728: Includes rendered propositions as display notifications in sendEvent after using applyPropositions", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(compose(getBaseConfig(), debugEnabled));

  const propositions = [
    {
      id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
      scope: "alloy-test-scope-1",
      scopeDetails: { decisionProvider: "TGT" },
      items: [
        {
          id: "442359",
          schema: "https://ns.adobe.com/personalization/html-content-item",
          data: {
            content: "<p>Some custom content for the home page</p>",
            format: "text/html",
            id: "1202448",
          },
        },
      ],
    },
  ];
  const metadata = {
    "alloy-test-scope-1": {
      selector: "#home-item1",
      actionType: "setHtml",
    },
  };
  const applyPropositionsResult = await alloy.applyPropositions({
    propositions,
    metadata,
  });

  const allPropositionsWereRendered =
    applyPropositionsResult.propositions.every((p) => p.renderAttempted);
  await t.expect(allPropositionsWereRendered).eql(true);
  await t.expect(applyPropositionsResult.propositions.length).eql(1);

  await alloy.sendEvent({
    personalization: { includeRenderedPropositions: true },
  });
  await t.expect(edgeEndpointLogs.requests.length).eql(1);
  const sendEventRequest = edgeEndpointLogs.requests.at(-1);
  const sendEventRequestBody = JSON.parse(sendEventRequest.request.body);
  const hasTargetDisplayNotifications = sendEventRequestBody.events.some(
    ({ xdm }) => xdm.eventType === "decisioning.propositionDisplay",
  );
  const hasPlatformDisplayNotifications = sendEventRequestBody.events.some(
    ({ xdm }) =>
      // eslint-disable-next-line no-underscore-dangle
      xdm._experience?.decisioning?.propositionEventType?.display === 1,
  );
  await t
    .expect(hasTargetDisplayNotifications || hasPlatformDisplayNotifications)
    .eql(true);
});
