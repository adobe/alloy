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
import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  thirdPartyCookiesDisabled,
  edgeDomainThirdParty
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  thirdPartyCookiesDisabled,
  edgeDomainThirdParty
);

createFixture({
  title:
    "C6984408: The legacy Adobe Target mbox cookie is included in requests",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C6984408",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C6984408: The legacy Adobe Target mbox cookie is included in requests when targetMigrationEnabled = true", async () => {
  // This is just a cookie that at.js created
  await t.setCookies({
    name: "mbox",
    value:
      "PC#2177ea922eab463aafe0a22206c12762.35_0#1722369340|session#786adef0b32d411fbd0cf08d1d1bef9c#1659126405",
    domain: "alloyio.com",
    path: "/"
  });

  const migrationEnabledConfig = compose(config, {
    targetMigrationEnabled: true
  });

  const alloy = createAlloyProxy();
  await alloy.configure(migrationEnabledConfig);
  await alloy.sendEvent({});

  const request = JSON.parse(
    networkLogger.edgeEndpointLogs.requests[0].request.body
  );
  await t.expect(request.meta).ok();
  await t.expect(request.meta.state).ok();
  await t.expect(request.meta.state.entries).ok();
  await t
    .expect(request.meta.state.entries.find(({ key }) => key === "mbox"))
    .ok();
  await t.expect(request.meta.target.migration).eql(true);
});
