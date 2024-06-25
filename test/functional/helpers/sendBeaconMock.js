/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { ClientFunction } from "testcafe";

const mock = ClientFunction(() => {
  const nativeSendBeacon = window.navigator.sendBeacon.bind(window.navigator);
  window.navigator.sendBeacon = (...args) => {
    const sendBeaconCallCount = Number(
      sessionStorage.getItem("sendBeaconCallCount") || 0,
    );
    sessionStorage.setItem("sendBeaconCallCount", sendBeaconCallCount + 1);
    return nativeSendBeacon(...args);
  };
});

const getCallCount = ClientFunction(() => {
  return Number(sessionStorage.getItem("sendBeaconCallCount") || 0);
});

const reset = ClientFunction(() => {
  sessionStorage.removeItem("sendBeaconCallCount");
});

/**
 * Mocks and calls through to the native sendBeacon API. Useful for
 * determining whether sendBeacon was used to make a network request.
 * This is typically better than using a network logger because sendBeacon,
 * at least in some browsers, asynchronously sends the request some time
 * after sendBeacon is called. This would make it tricky to assert, for example,
 * that a network request *wasn't* sent using sendBeacon because we would
 * have to wait an arbitrary time period before checking the network logger
 * to see that no requests were made to the collect endpoint.
 */
export default {
  mock,
  getCallCount,
  reset,
};
