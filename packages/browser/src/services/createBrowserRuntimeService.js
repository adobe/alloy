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

/** @import { RuntimeService } from "@adobe/alloy-core/services" */

/**
 * Browser implementation of {@link RuntimeService}. Forwards directly to the
 * native globals; all of these are available in every supported browser.
 *
 * @returns {RuntimeService}
 */
const createBrowserRuntimeService = () => ({
  setTimeout: window.setTimeout.bind(window),
  clearTimeout: window.clearTimeout.bind(window),
  atob: window.atob.bind(window),
  btoa: window.btoa.bind(window),
  TextEncoder: window.TextEncoder,
  TextDecoder: window.TextDecoder,
  now: () => Date.now(),
});

export default createBrowserRuntimeService;
