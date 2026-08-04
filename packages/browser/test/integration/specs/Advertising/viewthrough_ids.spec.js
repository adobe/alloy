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

import { test, describe, expect } from "../../helpers/testsSetup/extend.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import {
  createAdvertisingConfig,
  findViewThroughCalls,
  validateViewThroughCall,
  ADVERTISING_CONSTANTS,
} from "../../helpers/advertising.js";

describe("Advertising - Viewthrough with advertising IDs", () => {
  test("should send conversion query with advertising IDs in view-through", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    // TEMPORARY (viewthrough_ids CI-flake investigation): tap MSW lifecycle
    // events before any request fires, so an on-timeout dump can tell apart
    // "enrichment request never sent" from "sent but escaped to the network /
    // response never captured". Remove once the flake is root-caused.
    const mswEvents = [];
    const onStart = ({ request }) =>
      mswEvents.push({
        t: Date.now(),
        kind: "request:start",
        url: request.url,
      });
    const onMocked = ({ request, response }) =>
      mswEvents.push({
        t: Date.now(),
        kind: "response:mocked",
        url: request.url,
        status: response.status,
      });
    const onUnhandled = ({ request }) =>
      mswEvents.push({
        t: Date.now(),
        kind: "request:unhandled",
        url: request.url,
      });
    const onException = ({ request, error }) =>
      mswEvents.push({
        t: Date.now(),
        kind: "unhandledException",
        url: request.url,
        error: error.message,
      });
    worker.events.on("request:start", onStart);
    worker.events.on("response:mocked", onMocked);
    worker.events.on("request:unhandled", onUnhandled);
    worker.events.on("unhandledException", onException);

    await alloy("configure", {
      ...alloyConfig,
      ...createAdvertisingConfig({}),
    });

    await alloy("sendEvent", {
      advertising: { handleAdvertisingData: "auto" },
    });
    const sendEventResolvedAt = Date.now();

    // Poll for a *complete* view-through call rather than waiting a fixed time
    // then checking once: findCalls resolves on the first completed edge call,
    // which can precede the advertising enrichment call on a slow runner.
    const getFirstViewThrough = async () => {
      const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/, {
        retries: 1,
      });
      return findViewThroughCalls(calls)[0];
    };

    const configIdOf = (url) => {
      try {
        return new URL(url).searchParams.get("configId");
      } catch {
        return null;
      }
    };
    const dumpDiagnostics = (phase) => {
      const calls = networkRecorder.calls.map((c) => {
        const body =
          typeof c.request?.body === "object" ? c.request.body : null;
        const event = body?.events?.[0];
        return {
          requestId: c.requestId,
          request: c.request
            ? {
                url: c.request.url,
                configId: configIdOf(c.request.url),
                method: c.request.method,
                timestamp: c.request.timestamp,
                sequence: c.request.sequence,
                hasAdvertisingQuery: Boolean(event?.query?.advertising),
                eventType: event?.xdm?.eventType,
              }
            : null,
          response: c.response
            ? {
                status: c.response.status,
                timestamp: c.response.timestamp,
                sequence: c.response.sequence,
              }
            : null,
        };
      });
      console.error(
        `VIEWTHROUGH_FLAKE_DIAGNOSTIC ${JSON.stringify(
          {
            phase,
            now: Date.now(),
            sendEventResolvedAt,
            droppedCaptures: networkRecorder.droppedCaptures,
            calls,
            mswEvents,
          },
          null,
          2,
        )}`,
      );
    };

    try {
      await expect
        .poll(getFirstViewThrough, { timeout: 5000, interval: 100 })
        .toBeTruthy();

      validateViewThroughCall(await getFirstViewThrough(), {
        advIds: ADVERTISING_CONSTANTS.DEFAULT_ADVERTISER_IDS_STRING,
        requireIds: false,
      });
    } catch (error) {
      dumpDiagnostics("assertion-failed");
      throw error;
    } finally {
      worker.events.removeListener("request:start", onStart);
      worker.events.removeListener("response:mocked", onMocked);
      worker.events.removeListener("request:unhandled", onUnhandled);
      worker.events.removeListener("unhandledException", onException);
    }
  });
});
