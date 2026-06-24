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

/* eslint-disable dot-notation */

/** @import { GlobalsService } from "@adobe/alloy-core/services" */
import injectFireReferrerHideableImage from "@adobe/alloy-core/utils/dom/injectFireReferrerHideableImage.js";

/** @returns {GlobalsService} */
const createBrowserGlobalsService = () => ({
  getInstanceNames: () => window["__alloyNS"] || [],
  getInstanceQueue: (instanceName) => {
    const namespace = window[instanceName];
    return (namespace && namespace.q) || [];
  },
  getMonitors: () => window["__alloyMonitors"] || [],
  getLocationSearch: () => window.location.search,
  getLocationHash: () => window.location.hash,
  getUserAgent: () => window.navigator.userAgent,
  getHostname: () => window.location.hostname,
  getPageLocation: () => window.location,
  isPageSsl: () => window.location.protocol === "https:",
  fireReferrerHideableImage: injectFireReferrerHideableImage(),
  getWindowContext: () => ({
    title: document.title,
    url: window.location.href,
    referrer: document.referrer,
    height: window.innerHeight,
    width: window.innerWidth,
    scrollY: window.scrollY,
    scrollX: window.scrollX,
  }),
});

export default createBrowserGlobalsService;
