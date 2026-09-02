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

import packageJson from "../../package.json" with { type: "json" };
import getHeader from "../services/getHeader.js";

const LIBRARY_NAME = "https://ns.adobe.com/experience/alloy";
const { version: LIBRARY_VERSION } = packageJson;

/**
 * Node's analog to the browser bundle's Context component. No DOM to read
 * device/viewport/timezone from, so this only attaches `implementationDetails`
 * and, best-effort, `web.webPageDetails.URL` from the `Referer` header of
 * `forRequest({ request })`.
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
