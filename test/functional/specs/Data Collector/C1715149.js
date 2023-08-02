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
import createNetworkLogger from "../../helpers/networkLogger";
import createFixture from "../../helpers/createFixture";
import {
  debugEnabled,
  orgMainConfigMain
} from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createConsoleLogger from "../../helpers/consoleLogger";

const networkLogger = createNetworkLogger();

const onBeforeEventSend = ClientFunction(content => {
  window.onBeforeEventSendCalled = true;
  content.xdm.foo = "bar";
});

const onBeforeEventSendFailed = ClientFunction(() => {
  window.onBeforeEventSendCalled = true;
  throw new Error("Expected Error");
});

const onBeforeEventSendFalse = ClientFunction(() => {
  window.onBeforeEventSendCalled = true;
  return false;
});

const getOnBeforeEventSendCalled = ClientFunction(() => {
  return window.onBeforeEventSendCalled === true;
});

createFixture({
  title:
    "C1715149 sendEvent should call onBeforeEventSend callback and send when expected",
  requestHooks: [networkLogger.edgeInteractEndpointLogs]
});

test.meta({
  ID: "C1715149",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C1715149 Events should call onBeforeEventSend callback and still send event", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure({
    ...orgMainConfigMain,
    onBeforeEventSend
  });
  await alloy.sendEvent();

  await t.expect(getOnBeforeEventSendCalled()).eql(true);
  const request =
    networkLogger.edgeInteractEndpointLogs.requests[0].request.body;
  const parsedRequest = JSON.parse(request);
  await t.expect(parsedRequest.events[0].xdm.foo).eql("bar");
});

test("C1715149 Events should call onBeforeEventSend callback, fail, and not send event", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure({
    ...orgMainConfigMain,
    onBeforeEventSend: onBeforeEventSendFailed
  });
  const errorMessage = await alloy.sendEventErrorMessage();

  await t.expect(getOnBeforeEventSendCalled()).eql(true);
  await t.expect(errorMessage).match(/Expected Error/);
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(0);
});

test("C1715149 Events should call onBeforeEventSend callback, return false, and not send event", async () => {
  const logger = await createConsoleLogger();
  const alloy = createAlloyProxy();
  await alloy.configure({
    ...orgMainConfigMain,
    ...debugEnabled,
    onBeforeEventSend: onBeforeEventSendFalse
  });

  const result = await alloy.sendEvent();

  await t.expect(getOnBeforeEventSendCalled()).eql(true);

  // if event is cancelled, the promise should resolve with an empty object
  await t.expect(result).eql({});
  await t.expect(networkLogger.edgeInteractEndpointLogs.requests.length).eql(0);
  await logger.info.expectMessageMatching(/Event was canceled/);
});
