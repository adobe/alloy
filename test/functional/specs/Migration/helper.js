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
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createConsoleLogger from "../../helpers/consoleLogger";
import { injectAlloyDuringTest } from "../../helpers/createFixture/clientScripts";
import cookies from "../../helpers/cookies";
import getResponseBody from "../../helpers/networkLogger/getResponseBody";
import createResponse from "../../helpers/createResponse";

export const MIGRATION_LOCATION = "location-for-migration-testing";
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const extractCluster = hostname => {
  const values = hostname.split(".");
  return values[0];
};

export const injectAlloyAndSendEvent = async (config, options = {}) => {
  const alloy = createAlloyProxy();
  await alloy.configureAsync(config);
  await alloy.getLibraryInfoAsync();
  const logger = await createConsoleLogger();
  await injectAlloyDuringTest();
  await logger.info.expectMessageMatching(/Executing getLibraryInfo command/);
  await alloy.sendEvent(options);
};

export const assertTargetMigrationEnabledIsSent = async sendEventRequest => {
  const requestBody = JSON.parse(sendEventRequest.request.body);

  await t.expect(requestBody.meta.target).eql({ migration: true });
};

export const assertKonductorReturnsCookieAndCookieIsSet = async (
  cookieKey,
  sendEventRequest
) => {
  // Extract state:store payload
  const response = JSON.parse(getResponseBody(sendEventRequest));
  const stateStorePayload = createResponse({
    content: response
  }).getPayloadsByType("state:store");
  await t.expect(stateStorePayload.length).gte(0);

  const responseContainsCookie = stateStorePayload.find(entry => {
    return entry.key.includes(cookieKey);
  });
  await t.expect(responseContainsCookie).ok();
  // Check that cookie is set
  const cookieValue = await cookies.get(cookieKey);
  await t.expect(cookieValue).ok();

  return cookieValue;
};

export const getLocationHint = pathname => {
  const values = pathname.split("/");
  const locationHint = values[2];

  return Number(locationHint.split("t")[1]);
};

export const getEcid = identityPayload => {
  return identityPayload.filter(obj => obj.namespace.code === "ECID");
};

export const getPropositionCustomContent = personalizationPayload => {
  const decisionScopeProposition = personalizationPayload.filter(
    proposition => proposition.scope === MIGRATION_LOCATION
  );

  return decisionScopeProposition[0].items[0].data.content;
};

export const fetchMboxOffer = ClientFunction(
  ({ params = {}, mbox = "target-global-mbox" }) => {
    return window.adobe.target.getOffer({
      mbox,
      params,
      success(response) {
        return response;
      },
      // eslint-disable-next-line no-console
      error: console.error
    });
  }
);

export const assertSameLocationHintIsUsed = async (
  hostname,
  mboxEdgeClusterCookie
) => {
  const cluster = await extractCluster(hostname);
  await t
    .expect(`mboxedge${mboxEdgeClusterCookie}`)
    .eql(
      cluster,
      "Cluster ID returned from Target Upstream does not match the cluster ID  used in the path to Target Edge API"
    );
};
