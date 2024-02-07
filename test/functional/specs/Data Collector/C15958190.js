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
  title: "C15958190 Analytics maps long names from data",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C15958190",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C15958190 Analytics maps long names from data", async () => {
  const assuranceRequests = await createAssuranceRequestHook();
  await t.addRequestHooks(assuranceRequests);

  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await alloy.sendEvent({
    xdm: {},
    data: {
      __adobe: {
        analytics: {
          pageName: "C15958190-pagename",
          pageURL: "C15958190-pageurl",
          referrer: "C15958190-referrer",
          contextData: {
            "contextData-key": "C15958190-contextData-value"
          },
          currencyCode: "C15958190-currencyCode",
          purchaseID: "C15958190-purchaseID",
          channel: "C15958190-channel",
          server: "C15958190-server",
          pageType: "C15958190-pageType",
          transactionID: "C15958190-transactionID",
          campaign: "C15958190-campaign",
          zip: "C15958190-zip",
          events: "C15958190-events",
          events2: "C15958190-events2",
          products: "C15958190-products",
          linkURL: "C15958190-linkURL",
          linkName: "C15958190-linkName",
          linkType: "e",
          eVar1: "C15958190-eVar1",
          prop1: "C15958190-prop1",
          list1: "C15958190-list1",
          pe: "C15958190-pe",
          pev1: "C15958190-pev1",
          pev2: "C15958190-pev2",
          pev3: "C15958190-pev3",
          latitude: "C15958190-latitude",
          longitude: "C15958190-longitude",
          resolution: "C15958190-resolution",
          colorDepth: "C15958190-colorDepth",
          javascriptVersion: "C15958190-javascriptVersion",
          javaEnabled: "C15958190-javaEnabled",
          cookiesEnabled: "C15958190-cookiesEnabled",
          browserWidth: "C15958190-browserWidth",
          browserHeight: "C15958190-browserHeight",
          connectionType: "C15958190-connectionType"
        }
      }
    }
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);

  const mappingLog = await assuranceRequests.requests[0].find(log => {
    const { vendor, payload: { name } = {} } = log;
    return vendor === "com.adobe.analytics" && name === "analytics.mapping";
  });

  const mappings =
    mappingLog.payload.context.mappedQueryParams.unifiedjsqeonlylatest;
  console.log(JSON.stringify(mappings, null, 2));
  const expectedMappings = {
    gn: "C15958190-pageName",
    g: "C15958190-pageURL",
    r: "C15958190-referrer",
    "c.contextData-key": "C15958190-contextData-value",
    cc: "C15958190-currencyCode",
    purchaseID: "C15958190-purchaseID",
    ch: "C15958190-channel",
    server: "C15958190-server",
    gt: "C15958190-pageType",
    xact: "C15958190-transactionID",
    v0: "C15958190-campaign",
    zip: "C15958190-zip",
    events: "C15958190-events,C15958190-events2",
    products: "C15958190-products",
    pev1: "C15958190-linkURL",
    pev2: "C15958190-linkName",
    pe: "lnk_e",
    v1: "C15958190-eVar1",
    c1: "C15958190-prop1",
    list1: "C15958190-list1",
    pev3: "C15958190-pev3",
    lat: "C15958190-latitude",
    lon: "C15958190-longitude",
    s: "C15958190-resolution",
    c: "C15958190-colorDepth",
    j: "C15958190-javascriptVersion",
    v: "C15958190-javaEnabled",
    k: "C15958190-cookiesEnabled",
    bw: "C15958190-browserWidth",
    bh: "C15958190-browserHeight",
    ct: "C15958190-connectionType"
  };

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(expectedMappings)) {
    // eslint-disable-next-line no-await-in-loop
    await t.expect(mappings[key]).eql(expectedMappings[key]);
  }
});
