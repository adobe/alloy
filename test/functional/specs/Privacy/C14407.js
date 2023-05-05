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
import { CONSENT_IN } from "../../helpers/constants/consent";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import reloadPage from "../../helpers/reloadPage";

const networkLogger = createNetworkLogger();

createFixture({
  title: "C14407 - Consenting to all purposes should be persisted.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C14407",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const config = {
  edgeConfigId: "9999999",
  orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
  defaultConsent: "pending",
  idMigrationEnabled: false,
  debugEnabled: true
};

test("C14407 - Consenting to all purposes should be persisted.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.setConsent(CONSENT_IN);
  await reloadPage();
  await alloy.configure(config);
  await alloy.sendEvent();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);
});
