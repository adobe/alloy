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
import { responseStatus } from "../../helpers/assertions/index";
import createFixture from "../../helpers/createFixture";
import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { createAssuranceRequestHook } from "../../helpers/assurance";

const networkLogger = createNetworkLogger();
const config = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title: "C15958191 Data prep maps products to XDM",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C15958191",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C15958191 Data prep maps products to XDM", async () => {
  const assuranceRequests = await createAssuranceRequestHook();
  await t.addRequestHooks(assuranceRequests);

  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({
    xdm: {},
    data: {
      __adobe: {
        analytics: {
          eVar1: "eVar1Value",
          prop1: "prop1Value",
          products: ""
        }
      }
    }
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  const pipelineLog = await assuranceRequests.requests[0].find(log => {
    const { vendor, payload: { header: { msgType } = {} } = {} } = log;
    return (
      vendor === "com.adobe.streaming.validation" &&
      msgType === "xdmEntityCreate"
    );
  });
  const mappedXdm = pipelineLog.payload.body.xdmEntity;
  console.log(JSON.stringify(mappedXdm, null, 2));

  // TODO add assertions here that the mapping happened correctly.
});
