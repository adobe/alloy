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

// MSW's service worker does not surface sendBeacon for assertion, so the only
// way to observe collect-vs-interact routing is to record sendBeacon calls in
// the page — the same approach the functional suite took (sendBeaconMock.js).
//
// The recorder is necessarily global (installed in setupBaseCode before the
// alloy script is injected) rather than opt-in per spec: alloy creates its
// network service at bundle load, and createBrowserNetworkService binds
// navigator.sendBeacon *by value* (.bind) at that moment. A per-test beforeEach
// runs after the bundle has already loaded, so its swap would be ignored —
// verified empirically (the routing assertions saw zero recorded beacons).
//
// Returning true is the deliberate hermetic default, matching the functional
// suite: it suppresses any stray real beacon and tells alloy the beacon
// succeeded so it doesn't fall back to fetch. Specs that don't assert routing
// are unaffected, and any that need the fetch-fallback path could simulate it
// by recording false here.

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
