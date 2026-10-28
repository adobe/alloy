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

import { test, expect, describe, vi } from "../../helpers/testsSetup/extend.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";

describe("PLATIR-68133 - monitors registered after instance creation", () => {
  describe.each(["before configure", "after configure"])(
    "%s",
    (registrationTime) => {
      test("notifies monitoring hooks", async ({
        alloy,
        worker,
        networkRecorder,
      }) => {
        worker.use(sendEventHandler);

        const monitor = {
          onBeforeCommand: vi.fn(),
          onBeforeNetworkRequest: vi.fn(),
          onNetworkResponse: vi.fn(),
        };

        if (registrationTime === "before configure") {
          window.__alloyMonitors.push(monitor);
        }

        await alloy("configure", alloyConfig);

        if (registrationTime === "after configure") {
          window.__alloyMonitors.push(monitor);
        }

        await alloy("sendEvent", { xdm: { eventType: "monitor-regression" } });

        const call = await networkRecorder.waitForCall(/\/interact/);
        expect(call.response.status).toBe(200);

        expect.soft(monitor.onBeforeCommand).toHaveBeenCalledWith(
          expect.objectContaining({
            instanceName: "alloy",
            commandName: "sendEvent",
          }),
        );
        expect.soft(monitor.onBeforeNetworkRequest).toHaveBeenCalledOnce();
        expect.soft(monitor.onNetworkResponse).toHaveBeenCalledWith(
          expect.objectContaining({
            instanceName: "alloy",
            statusCode: 200,
            parsedBody: expect.any(Object),
          }),
        );
      });
    },
  );
});
