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

/** @import { GlobalsService } from "@adobe/alloy-core/services" */

/**
 * There is no page, DOM, or `<script>` queue in Node, so anything tied to
 * those concepts falls back to an empty/static default.
 *
 * @returns {GlobalsService}
 */
const createNodeGlobalsService = () => ({
  getInstanceNames: () => [],
  getInstanceQueue: () => [],
  getMonitors: () => [],
  getLocationSearch: () => "",
  getLocationHash: () => "",
  getUserAgent: () => "",
  getHostname: () => "",
  getPageLocation: () => ({ host: "", pathname: "" }),
  isPageSsl: () => true,
  fireReferrerHideableImage: async () => {},
  getWindowContext: () => ({
    title: "",
    url: "",
    referrer: "",
    height: 0,
    width: 0,
    scrollY: 0,
    scrollX: 0,
  }),
});

export default createNodeGlobalsService;
