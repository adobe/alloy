/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// Alloy binds navigator.sendBeacon once at instance creation (see
// createBrowserNetworkService), and MSW's service worker does not surface
// sendBeacon for assertion. So the only way to observe collect-vs-interact
// routing is to record sendBeacon calls in the page — the same approach the
// functional suite took (sendBeaconMock.js). The patch must be installed
// before the library script loads, so it lives in setupBaseCode alongside the
// permanent addEventListener patch: installed once per page lifetime, with the
// captured calls reset per test. Returning true keeps the suite hermetic (no
// stray real beacon) and tells alloy the beacon succeeded so it doesn't fall
// back to fetch.

export const installSendBeaconRecorder = () => {
  if (window.__alloySendBeaconInstalled) {
    return;
  }
  window.__alloySendBeaconInstalled = true;
  window.__alloySendBeaconCalls = [];
  window.navigator.sendBeacon = (url, data) => {
    window.__alloySendBeaconCalls.push({ url, data });
    return true;
  };
};

export const sendBeaconCalls = () => window.__alloySendBeaconCalls ?? [];

export const resetSendBeaconCalls = () => {
  window.__alloySendBeaconCalls = [];
};
