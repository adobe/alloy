/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export default () => {
  delete window.__alloyMonitors;
  delete window.__alloyNS;
  delete window.alloy;
  // Clear all alloy-namespaced cookies so throttle/consent/identity state
  // from one test file doesn't poison subsequent files. browser/integration
  // runs with `isolate: false`, so the cookie jar is shared across files.
  document.cookie.split(";").forEach((entry) => {
    const key = entry.trim().split("=")[0];
    if (key.startsWith("kndctr_")) {
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
};
