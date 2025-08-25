/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { Selector, t } from "testcafe";
import uuid from "../../../../packages/core/src/utils/uuid.js";
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
import { ADOBE_JOURNEY_OPTIMIZER } from "../../../../packages/core/src/constants/decisionProvider.js";

const networkLogger = createNetworkLogger();
const { edgeEndpointLogs } = networkLogger;

const orgMainConfigMain = getBaseConfig(
  "97D1F3F459CE0AD80A495CBE@AdobeOrg",
  "0a106b4d-1937-4196-a64d-4a324e972459",
);

test.meta({
  ID: "C22098199",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

createFixture({
  title:
    "C22098199 - Non-idempotent proposition actions are not applied multiple times",
  url: `${TEST_PAGE_URL}?test=C22098199`,
  requestHooks: [edgeEndpointLogs],
});

const containerId = "target-container";
const testPageBody = `
<div id="container">
  <h1 id="page-header">Hello World!</h1>
  <div id="${containerId}"></div>
</div>
`;

const createPropositions = ({
  propositionId = uuid(),
  viewName = "test",
  activityId = uuid(),
  items = [],
}) => {
  return [
    {
      id: propositionId,
      scope: `web://aepdemo.com/#${viewName}`,
      scopeDetails: {
        decisionProvider: ADOBE_JOURNEY_OPTIMIZER,
        correlationID: "6dae465b-9553-4fc6-b7d4-6c9979c88f21-0",
        characteristics: {
          eventToken:
            "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6IlVFOkluYm91bmQiLCJtZXNzYWdlSUQiOiJmMzgxZWJhYS1kNDIyLTQxNzQtOWUzNS0yMTY3NDYwMjk5MTAiLCJtZXNzYWdlUHVibGljYXRpb25JRCI6IjZkYWU0NjViLTk1NTMtNGZjNi1iN2Q0LTZjOTk3OWM4OGYyMSIsIm1lc3NhZ2VUeXBlIjoibWFya2V0aW5nIiwiY2FtcGFpZ25JRCI6ImVhZDg5MWE0LTNjYWUtNGE1ZC05MGEzLTFkZTc0MzkwYjNkMyIsImNhbXBhaWduVmVyc2lvbklEIjoiZDhiYzk5YmMtZGRhZC00Y2MyLThlYjItYTJlMGUzY2FmNzg0IiwiY2FtcGFpZ25BY3Rpb25JRCI6IjQzNmZmM2NkLTZkZWItNDczNi04NDc1LTA3NDhhYzc4MTlkOCJ9LCJtZXNzYWdlUHJvZmlsZSI6eyJtZXNzYWdlUHJvZmlsZUlEIjoiMDg5NGYwNmYtOTkyNi00YTc2LTk4OTktYThmZjc3NWZmNTA4IiwiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvd2ViIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy93ZWIifX19",
          viewName,
          scopeType: "view",
        },
        activity: {
          id: activityId,
        },
      },
      items: [...items],
    },
  ];
};

/**
 * @param {string} action
 */
const createTest = (action) => async () => {
  const config = compose(orgMainConfigMain, debugEnabled);
  const propositionId = uuid();
  const itemId = uuid();

  const contentId = "prepended-content";
  const propositions = createPropositions({
    propositionId,
    items: [
      {
        id: itemId,
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: action,
          content: `<div id="${contentId}">This is content—${action}</div>`,
          selector: `#${containerId}`,
        },
      },
    ],
  });

  await addHtmlToBody(testPageBody, true);

  const alloy = createAlloyProxy();
  await alloy.configure(config);

  // First application
  await alloy.applyPropositions({
    propositions,
  });

  const container = Selector(`#${containerId}`).addCustomDOMProperties({
    renderedIds: (el) => el.dataset.adobePropositionIds,
  });
  const renderedContent = Selector(`#${contentId}`);
  // Verify the content was prepended once
  await t.expect(renderedContent.count).eql(1);
  await t.expect(container.renderedIds).ok();
  await t.expect(container.renderedIds).contains(itemId);

  // Second application - should not append again

  await alloy.applyPropositions({
    propositions,
  });

  // Verify the content was not appended again
  await t.expect(renderedContent.count).eql(1);
};

["prependHtml", "appendHtml", "insertBefore", "insertAfter"].forEach(
  (action) => {
    test(
      `Test C17409729: Proposition with ${action} action is not applied multiple times`,
      createTest(action),
    );
  },
);

test("setHtml propositions should be able to be re-rendered multiple times.", async () => {
  const config = compose(orgMainConfigMain, debugEnabled);
  const propositionId = uuid();
  const itemId = uuid();

  const targetHeadline = "Target Modified Headline";
  const originalHeadline = "Original Headline";
  const propositions = createPropositions({
    propositionId,
    items: [
      {
        id: itemId,
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "setHtml",
          content: `<h1>${targetHeadline}</h1>`,
          selector: `#${containerId}`,
        },
      },
    ],
  });

  const spaPageBody = `
  <div id="container">
    <h1 id="page-header">Hello World!</h1>
    <div id="${containerId}">
      <h1>${originalHeadline}</h1>
    </div>
  </div>
  `;

  await addHtmlToBody(spaPageBody, true);

  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await alloy.applyPropositions({
    propositions,
  });

  const container = Selector(`#${containerId}`).addCustomDOMProperties({
    innerHTML: (el) => el.innerHTML,
  });

  await t.expect(container.innerHTML).contains(targetHeadline);

  // "Navigate" to new SPA view
  await t.eval(() => {
    const targetContainer = document.getElementById("target-container");
    if (targetContainer) {
      targetContainer.innerHTML = `<h1>Sports/Politics Content</h1>`;
    }
  });

  // Verify "navigation" worked
  await t.expect(container.innerHTML).contains("Sports/Politics Content");

  // "Navigate" back
  await alloy.applyPropositions({
    propositions,
  });

  // TODO: This fails, but it should pass. applyPropositions should be able to be called multiple times and work every time.
  await t.expect(container.innerHTML).notContains("Sports/Politics Content");
  await t.expect(container.innerHTML).contains(targetHeadline);
});
