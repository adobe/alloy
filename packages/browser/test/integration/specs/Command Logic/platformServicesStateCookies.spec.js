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

/**
 * Regression guard for the Wave 4 migration: verifies that state:store payloads
 * from server responses are still written to document.cookie now that the cookie
 * jar is injected via platformServices rather than accessed as a singleton.
 */

import {
  test,
  expect,
  describe,
  afterEach,
} from "../../helpers/testsSetup/extend.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";

const CLUSTER_COOKIE = "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_cluster";

afterEach(() => {
  document.cookie = `${CLUSTER_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
});

describe("PlatformServices wiring — state:store cookie writes", () => {
  test("sendEvent response with state:store payload writes cookies via the browser cookie service", async ({
    alloy,
    worker,
  }) => {
    worker.use(sendEventHandler);
    await alloy("configure", alloyConfig);
    await alloy("sendEvent");

    // The sendEventResponse.json state:store payload sets the cluster routing cookie.
    // If the cookie service is mis-wired this cookie will be absent.
    expect(document.cookie).toContain(CLUSTER_COOKIE);
  });
});
