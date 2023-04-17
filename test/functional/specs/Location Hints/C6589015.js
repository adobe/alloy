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
import cookies from "../../helpers/cookies";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  thirdPartyCookiesDisabled,
  debugEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { MAIN_CLUSTER_COOKIE_NAME } from "../../helpers/constants/cookies";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  debugEnabled,
  thirdPartyCookiesDisabled
);

createFixture({
  title:
    "C6589015: The Experience Edge location hint is used on the second request.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C6589015",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C6589015: The Experience Edge location hint is used on the second request.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({});

  const locationHint = await cookies.get(MAIN_CLUSTER_COOKIE_NAME);
  await t.expect(locationHint).ok();

  await alloy.sendEvent({});

  const urls = networkLogger.edgeEndpointLogs.requests.map(r => r.request.url);
  await t.expect(urls[0]).match(new RegExp("^https://[^/]+/[^/]+/v1/interact"));
  await t
    .expect(urls[1])
    .match(new RegExp(`^https://[^/]+/[^/]+/${locationHint}/v1/interact`));
});
