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

import alloyConfig from "../../helpers/alloy/config.js";
import { sendEventWithIdentityCookieHandler } from "../../helpers/mswjs/handlers.js";
import { test, expect } from "../../helpers/testsSetup/extend.js";
import { withTemporaryUrl } from "../../helpers/utils/location.js";
import { sendBeaconCalls } from "../../helpers/utils/sendBeacon.js";

for (const authoring of [false, true]) {
  test(`C5298194: interact and collect return propositions${authoring ? " in authoring mode" : ""}`, async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    await withTemporaryUrl(async ({ currentHref, applyUrl }) => {
      const url = new URL(currentHref);
      if (authoring) url.searchParams.set("adobe_authoring_enabled", "true");
      applyUrl(url);
      worker.use(sendEventWithIdentityCookieHandler);
      await alloy("configure", alloyConfig);
      const interact = await alloy("sendEvent");
      expect(interact.propositions).toEqual(expect.any(Array));
      const calls = await networkRecorder.findCalls(/v1\/interact/);
      expect(calls).toHaveLength(1);
      expect(sendBeaconCalls()).toHaveLength(0);
      if (authoring)
        expect(
          calls[0].request.body.events[0].query.personalization.enabled,
        ).toBe(false);
      const collect = await alloy("sendEvent", { documentUnloading: true });
      expect(collect.propositions).toEqual(expect.any(Array));
      expect(sendBeaconCalls()).toHaveLength(1);
      expect(sendBeaconCalls()[0].url).toMatch(/\/v1\/collect/);
      expect(await networkRecorder.findCalls(/v1\/interact/)).toHaveLength(1);
    });
  });
}
