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
import { ClientFunction, RequestMock, t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import { inAppMessagesPropositions } from "../../fixtures/Personalization/conflictResolution.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import getBaseConfig from "../../helpers/getBaseConfig.js";
import {
  compose,
  debugEnabled,
} from "../../helpers/constants/configParts/index.js";

const networkLogger = createNetworkLogger();

const organizationId = "5BFE274A5F6980A50A495C08@AdobeOrg";
const dataStreamId = "ae47e1ea-7625-49b9-b69f-8ad372e46344";

const orgMainConfigMain = getBaseConfig(organizationId, dataStreamId);
const config = compose(orgMainConfigMain, debugEnabled);

const firstInteractCallReturnsInAppMessagesMock = () => {
  let i = 0;
  return RequestMock()
    .onRequestTo((request) => {
      if (request.url.includes("/interact")) {
        i += 1;
      }

      const r = request.url.includes("/interact") && i === 2;
      return r;
    })
    .respond(JSON.stringify(inAppMessagesPropositions), 200, {
      "access-control-allow-origin": "https://alloyio.com",
      "access-control-allow-credentials": true,
      "content-type": " application/json;charset=utf-8",
    });
};

createFixture({
  title:
    "Conflict resoulution: show one in app message propositions sorted by rank",
  requestHooks: [
    firstInteractCallReturnsInAppMessagesMock(),
    networkLogger.edgeEndpointLogs,
  ],
});

test("propositions are sorted ascending by rank", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  // Sending an event for getting an Identity cookie.
  await alloy.sendEvent();

  await alloy.sendEvent({
    renderDecisions: true,
  });

  const result = await alloy.evaluateRulesets({
    renderDecisions: true,
  });

  // When we receive multiple In-App messages propositions, DecisioningEngine will sort them ascending by rank.
  // Lower rank means higher priority. We need to diplay just one proposition (with the rank 1). There can be
  // multiple propositions with the same rank but with different surfaces.
  // The mock returns the propositions in descending order by rank.
  // For the displayed propositions an event with the type decisioning.propositionDisplay is sent back to the edge.
  // For the suppressed propositions an event with the type decisioning.propositionSuppressDisplay is sent back to the edge.
  await t.expect(result.propositions[0].scopeDetails.rank).eql(1);
  await t.expect(result.propositions[1].scopeDetails.rank).eql(2);

  const edgeRequest = networkLogger.edgeEndpointLogs.requests;

  const propositionDisplayEvent = edgeRequest[edgeRequest.length - 2];
  const propositionDisplayEventBody = JSON.parse(
    propositionDisplayEvent.request.body,
  );

  await t
    .expect(propositionDisplayEventBody.events[0].xdm.eventType)
    .eql("decisioning.propositionDisplay");
  await t
    .expect(
      // eslint-disable-next-line no-underscore-dangle
      propositionDisplayEventBody.events[0].xdm._experience.decisioning
        .propositions[0].id,
    )
    .eql("id1");

  const propositionSuppressDisplayEvent = edgeRequest[edgeRequest.length - 1];
  const propositionSuppressDisplayEventBody = JSON.parse(
    propositionSuppressDisplayEvent.request.body,
  );

  await t
    .expect(propositionSuppressDisplayEventBody.events[0].xdm.eventType)
    .eql("decisioning.propositionSuppressDisplay");
  await t
    .expect(
      // eslint-disable-next-line no-underscore-dangle
      propositionSuppressDisplayEventBody.events[0].xdm._experience.decisioning
        .propositions[0].id,
    )
    .eql("id2");

  // Check there is only one iframe in the DOM.
  const iframesContent = await ClientFunction(() => {
    const iframes = document.querySelectorAll("#alloy-content-iframe");
    const r = [];
    iframes.forEach((i) => {
      r.push(i.contentDocument.body.textContent);
    });
    return r;
  })();
  await t.expect(iframesContent.length).eql(1);
  await t.expect(iframesContent[0]).eql("Proposition 1");
});
