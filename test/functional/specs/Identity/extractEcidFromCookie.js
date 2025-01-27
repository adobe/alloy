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
import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import {
  compose,
  orgMainConfigMain,
} from "../../helpers/constants/configParts/index.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import reloadPage from "../../helpers/reloadPage.js";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain);

createFixture({
  title: "Extract ECID from cookie",
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.only("Extracts ECID from kndctr cookie", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  const {
    identity: { ECID: networkEcid },
  } = await alloy.getIdentity();
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(1);

  await reloadPage();
  const {
    identity: { ECID: cookieEcid },
  } = await alloy.getIdentity();
  await t.expect(cookieEcid).eql(networkEcid);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(0);
});
