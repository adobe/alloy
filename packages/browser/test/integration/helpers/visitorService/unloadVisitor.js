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

// Visitor.js keeps instances, the resolved ECID and opt-in state in globals.
// Tests share one page, so these must be dropped for the next test to load a
// fresh copy that requests the ECID again.
// Visitor.js declares its globals with `var`, so they can't be deleted.
// Instances outlive the test through pending callbacks and keep writing the
// AMCV cookie, so their cookie writers are disabled first.
export default () => {
  (window.s_c_il || []).forEach((instance) => {
    if (instance && typeof instance.cookieWrite === "function") {
      instance.cookieWrite = () => true;
      instance._writeVisitor = () => {};
    }
  });
  document
    .querySelectorAll('script[src*="/e2e/js/visitor"]')
    .forEach((script) => script.remove());
  window.Visitor = undefined;
  window.visitor = undefined;
  window.adobe = undefined;
  window.s_c_il = [];
  window.s_c_in = 0;
};
