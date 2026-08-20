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

/** @import { NodeRequestLike } from "../services/createNodePlatformServices.js" */

import getHeader from "../services/getHeader.js";

// Mirrors @adobe/alloy-core/constants/libraryName.js, hardcoded here rather
// than imported to avoid pulling core's build-time __VERSION__ placeholder
// (never replaced in Node's unbundled source) and to keep Node's own
// implementationDetails.version tied to @adobe/alloy-node's own version,
// which is independent of the browser bundle's.
const LIBRARY_NAME = "https://ns.adobe.com/experience/alloy";
const LIBRARY_VERSION = "1.0.0-beta.0";

/**
 * Required (always active) Node component analogous to the browser bundle's
 * Context component. There's no DOM to read device/viewport/timezone info
 * from, so unlike the browser version this only attaches:
 *
 * - `implementationDetails`, unconditionally.
 * - `web.webPageDetails.URL`, best-effort, from the `Referer` header of the
 *   request passed to `forRequest({ request })` — the closest Node
 *   equivalent of "the page the visitor is on," since it's usually the page
 *   that called this server's endpoint in a hybrid-personalization setup.
 *
 * Everything else the browser's Context collects (screen size, viewport,
 * local timezone) has no honest server-side source and is deliberately not
 * guessed at here — a caller who has real values for those can still merge
 * them directly via `sendEvent({ xdm })`.
 *
 * @param {Object} params
 * @param {{ request?: NodeRequestLike }} params.platformServices
 */
const createContext = ({ platformServices }) => ({
  lifecycle: {
    /** @param {{ event: any }} params */
    onBeforeEvent({ event }) {
      event.mergeXdm({
        implementationDetails: {
          name: LIBRARY_NAME,
          version: LIBRARY_VERSION,
          environment: "server",
        },
      });

      const referer = getHeader(platformServices.request?.headers, "referer");
      if (typeof referer === "string" && referer) {
        event.mergeXdm({
          web: { webPageDetails: { URL: referer } },
        });
      }

      return Promise.resolve();
    },
  },
});

createContext.namespace = "Context";

export default createContext;
