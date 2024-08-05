/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { t } from "testcafe";
import createNetworkLogger from "./networkLogger/index.js";
import sendBeaconMock from "./sendBeaconMock.js";

/**
 * A useful utility when dealing with assertions related to
 * the collect endpoint. Alloy sends requests to the collect endpoint
 * using sendBeacon if sendBeacon is supported by the browser. When
 * sendBeacon is called, the browser doesn't send the request right
 * away, but instead queues the request to be sent sometime
 * later, which can make it tricky to correctly assert that requests
 * have or have not been sent to the endpoint.
 */
export default async () => {
  const networkLogger = createNetworkLogger();
  await t.addRequestHooks(
    networkLogger.edgeInteractEndpointLogs,
    networkLogger.edgeCollectEndpointLogs,
  );

  await sendBeaconMock.mock();
  const assertCollectCalled = async () => {
    // When sendBeacon is called, the browser doesn't send the request right away,
    // but instead queues the request to be sent sometime later. Therefore, the
    // sendEvent promise resolves before any network request may have actually been made.
    // By calling the RequestLogger's count method, TestCafe will retry this
    // assertion until it succeeds or until the timeout is reached. The parameter
    // to count is a filter function. In this case, we want to count all the requests.
    await t
      .expect(networkLogger.edgeCollectEndpointLogs.count(() => true))
      .eql(1, "No network request to the collect endpoint was detected.");
    // If sendBeacon is supported by the browser, we should always be using it when
    // sending requests to the collect endpoint.
    await t
      .expect(sendBeaconMock.getCallCount())
      .eql(1, "No sendBeacon call was detected.");
  };

  const assertCollectNotCalled = async () => {
    // When sendBeacon is called, the browser doesn't send the request right away,
    // but instead queues the request to be sent sometime later. Therefore, the
    // sendEvent promise resolves before any network request may have actually been made.
    // In order to check that a request to the collect endpoint is never made, we would
    // have to wait for an arbitrary period of time before checking that the number of
    // network requests to the collect endpoint is 0. Instead of waiting for an arbitrary
    // period of time, which is a fragile and slow solution, we'll make our best attempt
    // at this assertion by checking that sendBeacon was never called. If supported by the
    // browser, sendBeacon is solely used to send requests to collect, so it's a fair approximation.
    await t
      .expect(sendBeaconMock.getCallCount())
      .eql(0, "A network request to the collect endpoint was detected.");
  };

  const assertInteractCalled = async () => {
    await t
      .expect(networkLogger.edgeInteractEndpointLogs.requests.length)
      .eql(1, "No network request to the interact endpoint was detected.");
  };

  const assertInteractNotCalled = async () => {
    await t
      .expect(networkLogger.edgeInteractEndpointLogs.requests.length)
      .eql(0, "A network request to the interact endpoint was detected.");
  };

  let collectRequestAsserted = false;
  let interactRequestAsserted = false;
  return {
    async assertCollectCalledAndNotInteract() {
      collectRequestAsserted = true;
      // The order of these matter because we need to make sure sendBeacon
      // requests have actually been sent by the browser before checking
      // that they weren't interact calls.
      await assertCollectCalled();
      await assertInteractNotCalled();
    },
    async assertInteractCalledAndNotCollect() {
      interactRequestAsserted = true;
      await assertCollectNotCalled();
      await assertInteractCalled();
    },
    async assertNeitherCollectNorInteractCalled() {
      await assertCollectNotCalled();
      await assertInteractNotCalled();
    },
    async reset() {
      interactRequestAsserted = false;
      collectRequestAsserted = false;
      await networkLogger.clearLogs();
      await sendBeaconMock.reset();
    },
    getInteractRequest() {
      if (!interactRequestAsserted) {
        throw new Error(
          "You must call assertInteractCalledAndNotCollect before getting the interact request",
        );
      }
      return networkLogger.edgeInteractEndpointLogs.requests[0];
    },
    getCollectRequest() {
      if (!collectRequestAsserted) {
        throw new Error(
          "You must call assertCollectCalledAndNotInteract before getting the collect request",
        );
      }
      return networkLogger.edgeCollectEndpointLogs.requests[0];
    },
  };
};
