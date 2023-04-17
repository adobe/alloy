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
import { t, ClientFunction } from "testcafe";
import fetch from "node-fetch";
import uuid from "uuid/v4";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import { compose, debugEnabled } from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import getBaseConfig from "../../helpers/getBaseConfig";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url";
import addHtmlToBody from "../../helpers/dom/addHtmlToBody";
import {
  testPageBody,
  testPageHead
} from "../../fixtures/Personalization/C6364800";
import addHtmlToHeader from "../../helpers/dom/addHtmlToHeader";

const networkLogger = createNetworkLogger();
const organizationId = "97D1F3F459CE0AD80A495CBE@AdobeOrg";
const dataStreamId = "0a106b4d-1937-4196-a64d-4a324e972459";
const testMboxName = "sample-json-offer";

const orgMainConfigMain = getBaseConfig(organizationId, dataStreamId);
const config = compose(orgMainConfigMain, debugEnabled);

const convertHeadersToSimpleJson = res => {
  const headersPromise = new Promise(resolve => {
    const result = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const pair of res.headers.entries()) {
      result[pair[0]] = pair[1];
    }
    resolve(result);
  });

  return Promise.all([headersPromise, res.json()]);
};

const getAepEdgeResponse = async requestId => {
  const requestBody = {
    event: {
      xdm: {
        web: {
          webPageDetails: {
            URL: "http://localhost/"
          },
          webReferrer: {
            URL: ""
          }
        },
        timestamp: "2022-07-13T17:48:20.134Z"
      },
      data: {}
    },
    query: {
      identity: {
        fetch: ["ECID"]
      },
      personalization: {
        schemas: [
          "https://ns.adobe.com/personalization/default-content-item",
          "https://ns.adobe.com/personalization/html-content-item",
          "https://ns.adobe.com/personalization/json-content-item",
          "https://ns.adobe.com/personalization/redirect-item",
          "https://ns.adobe.com/personalization/dom-action"
        ],
        decisionScopes: ["__view__", testMboxName]
      }
    },
    meta: {
      state: {
        domain: "localhost",
        cookiesEnabled: true,
        entries: [
          {
            key: "kndctr_97D1F3F459CE0AD80A495CBE_AdobeOrg_identity",
            value:
              "CiY2MDgwODYyMjY3NzUyNDQ4NzE4NDE0NzEzMDExMzQyMTQ4NjY4MFIOCKy2hPOeMBgBKgNPUjLwAcKt2ZyfMA=="
          },
          {
            key: "kndctr_97D1F3F459CE0AD80A495CBE_AdobeOrg_cluster",
            value: "or2"
          }
        ]
      }
    }
  };

  return fetch(
    `https://edge.adobedc.net/ee/v2/interact?dataStreamId=${dataStreamId}&requestId=${requestId}`,
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "text/plain; charset=UTF-8",
        pragma: "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "sec-gpc": "1",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        Referer: "http://localhost/"
      },
      body: JSON.stringify(requestBody),
      method: "POST"
    }
  ).then(convertHeadersToSimpleJson);
};

test.meta({
  ID: "C6364800",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

createFixture({
  title:
    "C6364800 applyResponse accepts a response, updates DOM and returns decisions",
  url: `${TEST_PAGE_URL}?test=C6364800`,
  requestHooks: [networkLogger.edgeEndpointLogs]
});

const getPageHeaderText = ClientFunction(() => {
  const element = document.querySelector(".page-header");

  if (!element) {
    return "";
  }
  return element.innerText;
});

const getAlertText = ClientFunction(() => {
  const element = document.querySelector(".alert.alert-success");

  if (!element) {
    return "";
  }
  return element.innerText;
});

const getEdgeResponseDecision = responseBody => {
  const { handle = [] } = responseBody;

  const personalization = handle.find(
    h => h.type === "personalization:decisions"
  );

  if (!personalization) {
    return undefined;
  }

  return personalization.payload.find(
    decision => decision.scope === testMboxName
  );
};

test("C6364800 applyResponse accepts a response, updates DOM and returns decisions", async () => {
  const [responseHeaders, responseBody] = await getAepEdgeResponse(uuid());

  await addHtmlToHeader(testPageHead);
  await addHtmlToBody(testPageBody, true);

  const alloy = createAlloyProxy();
  await alloy.configure(config);
  const { decisions } = await alloy.applyResponse({
    renderDecisions: true,
    responseHeaders,
    responseBody
  });

  const edgeResponseDecision = getEdgeResponseDecision(responseBody);

  const alloyDecision = decisions.find(
    decision => decision.scope === testMboxName
  );

  // validate the decision is found in the result for a target form-based activity
  // https://experience.adobe.com/#/@unifiedjslab/target/activities/activitydetails/A-B/aep-edge-samplessample-hero-image
  await t.expect(alloyDecision).eql(edgeResponseDecision);

  // validate alloy updated the DOM for target VEC activity in response
  // https://experience.adobe.com/#/@unifiedjslab/target/activities/activitydetails/A-B/aep-edge-samplesvecoffer
  const pageHeaderText = getPageHeaderText();
  await t.expect(pageHeaderText).notEql("Hello World!");
  await t.expect(pageHeaderText).match(/(Greetings.+)|(Thanks.+)/);
  await t.expect(getAlertText()).match(/This is Experience [AB]\./);
});

test("C6364800 applyResponse applies personalization when called after a sendEvent", async () => {
  const [responseHeaders, responseBody] = await getAepEdgeResponse(uuid());

  await addHtmlToHeader(testPageHead);
  await addHtmlToBody(testPageBody, true);

  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({});
  const { decisions } = await alloy.applyResponse({
    renderDecisions: true,
    responseHeaders,
    responseBody
  });

  const edgeResponseDecision = getEdgeResponseDecision(responseBody);

  const alloyDecision = decisions.find(
    decision => decision.scope === testMboxName
  );

  // validate the decision is found in the result for a target form-based activity
  // https://experience.adobe.com/#/@unifiedjslab/target/activities/activitydetails/A-B/aep-edge-samplessample-hero-image
  await t.expect(alloyDecision).eql(edgeResponseDecision);

  // validate alloy updated the DOM for target VEC activity in response
  // https://experience.adobe.com/#/@unifiedjslab/target/activities/activitydetails/A-B/aep-edge-samplesvecoffer
  const pageHeaderText = getPageHeaderText();
  await t.expect(pageHeaderText).notEql("Hello World!");
  await t.expect(pageHeaderText).match(/(Greetings.+)|(Thanks.+)/);
  await t.expect(getAlertText()).match(/This is Experience [AB]\./);
});
