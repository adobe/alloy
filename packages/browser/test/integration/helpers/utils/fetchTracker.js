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

// Counts fetches started in the page that have not settled yet. The network
// recorder only learns about a request once MSW emits request:start, which
// under load can lag well behind the fetch() call; this count covers that gap
// so teardown can wait for requests the recorder has not seen yet.
//
// Like the sendBeacon recorder, this must be installed before the alloy
// script loads, because alloy captures fetch by value at bundle load.

export const installFetchTracker = () => {
  if (window.__alloyFetchTrackerInstalled) {
    return;
  }
  window.__alloyFetchTrackerInstalled = true;
  window.__alloyPendingFetches = 0;
  const originalFetch = window.fetch.bind(window);
  window.fetch = (...args) => {
    window.__alloyPendingFetches += 1;
    const settle = () => {
      window.__alloyPendingFetches -= 1;
    };
    const result = originalFetch(...args);
    result.then(settle, settle);
    return result;
  };
};

export const pendingFetchCount = () => window.__alloyPendingFetches ?? 0;
