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

import { http, HttpResponse } from "msw";
import { test, expect, describe, vi } from "../../helpers/testsSetup/extend.js";
import {
  sendEventWithIdentityCookieHandler,
  sendEventHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import {
  sendBeaconCalls,
  resetSendBeaconCalls,
} from "../../helpers/utils/sendBeacon.js";

const INTERACT = /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/interact/;
const COLLECT = /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/collect/;

const ok = () => HttpResponse.json({ requestId: "ok", handle: [] });
const status = (code, headers) => () =>
  HttpResponse.json(
    { errors: [{ code: `status-${code}` }] },
    { status: code, headers },
  );
const networkError = () => HttpResponse.error();

// Replays `script` one entry per request, repeating the last entry forever,
// and records when (and how) each request arrived.
const scriptedInteract = (script) => {
  const requests = [];
  const handler = http.post(INTERACT, ({ request }) => {
    requests.push({ at: Date.now(), keepalive: request.keepalive });
    return script[Math.min(requests.length - 1, script.length - 1)]();
  });
  return { handler, requests };
};

const settle = async (promise) => {
  try {
    return { value: await promise };
  } catch (error) {
    return { error };
  }
};

describe("network retry behavior of sendEvent", () => {
  test.for([429, 502, 503, 504])(
    "retries a %i response and resolves when the retry succeeds",
    async (code, { alloy, worker }) => {
      const { handler, requests } = scriptedInteract([
        status(code, { "Retry-After": "0" }),
        ok,
      ]);
      worker.use(handler);
      await alloy("configure", alloyConfig);

      await expect(alloy("sendEvent")).resolves.toBeDefined();

      expect(requests).toHaveLength(2);
    },
  );

  test.for([400, 401, 403, 404, 500])(
    "does not retry a %i response and rejects with the server status",
    async (code, { alloy, worker }) => {
      const { handler, requests } = scriptedInteract([
        status(code, { "Retry-After": "0" }),
        ok,
      ]);
      worker.use(handler);
      await alloy("configure", alloyConfig);

      const { error } = await settle(alloy("sendEvent"));

      expect(error.message).toContain(
        `The server responded with a status code ${code}`,
      );
      expect(requests).toHaveLength(1);
    },
  );

  test("waits at least 700ms before retrying when the response has no Retry-After header", async ({
    alloy,
    worker,
  }) => {
    const { handler, requests } = scriptedInteract([status(503), ok]);
    worker.use(handler);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent");

    // First delay is 1000ms +/- 30%.
    const gap = requests[1].at - requests[0].at;
    expect(gap).toBeGreaterThanOrEqual(700);
    expect(gap).toBeLessThan(2500);
  });

  test("waits the number of seconds in an integer Retry-After header before retrying", async ({
    alloy,
    worker,
  }) => {
    const { handler, requests } = scriptedInteract([
      status(429, { "Retry-After": "2" }),
      ok,
    ]);
    worker.use(handler);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent");

    const gap = requests[1].at - requests[0].at;
    expect(gap).toBeGreaterThanOrEqual(1900);
    expect(gap).toBeLessThan(3500);
  });

  test("retries immediately when Retry-After is 0 instead of using the default delay", async ({
    alloy,
    worker,
  }) => {
    const { handler, requests } = scriptedInteract([
      status(503, { "Retry-After": "0" }),
      ok,
    ]);
    worker.use(handler);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent");

    expect(requests[1].at - requests[0].at).toBeLessThan(500);
  });

  test("waits until the date in an HTTP-date Retry-After header before retrying", async ({
    alloy,
    worker,
  }) => {
    const { handler, requests } = scriptedInteract([
      () =>
        status(503, {
          "Retry-After": new Date(Date.now() + 2000).toUTCString(),
        })(),
      ok,
    ]);
    worker.use(handler);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent");

    // HTTP-dates have one-second resolution, so the target is 1-2s away.
    const gap = requests[1].at - requests[0].at;
    expect(gap).toBeGreaterThanOrEqual(500);
    expect(gap).toBeLessThan(3500);
  });

  test("retries immediately when the Retry-After HTTP-date is in the past", async ({
    alloy,
    worker,
  }) => {
    const { handler, requests } = scriptedInteract([
      status(503, {
        "Retry-After": new Date(Date.now() - 60000).toUTCString(),
      }),
      ok,
    ]);
    worker.use(handler);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent");

    expect(requests[1].at - requests[0].at).toBeLessThan(500);
  });

  test("respects Retry-After on a retryable status other than 429 or 503", async ({
    alloy,
    worker,
  }) => {
    const { handler, requests } = scriptedInteract([
      status(504, { "Retry-After": "2" }),
      ok,
    ]);
    worker.use(handler);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent");

    expect(requests[1].at - requests[0].at).toBeGreaterThanOrEqual(1900);
  });

  test("sends 4 requests in total then rejects with the last status when every response is retryable", async ({
    alloy,
    worker,
  }) => {
    const { handler, requests } = scriptedInteract([
      status(503, { "Retry-After": "0" }),
    ]);
    worker.use(handler);
    await alloy("configure", alloyConfig);

    const { error } = await settle(alloy("sendEvent"));

    expect(requests).toHaveLength(4);
    expect(error.message).toContain(
      "The server responded with a status code 503",
    );
    expect(error.message).not.toContain("Network request failed.");
  });

  test("succeeds on the fourth request after three retryable responses", async ({
    alloy,
    worker,
  }) => {
    const { handler, requests } = scriptedInteract([
      status(503, { "Retry-After": "0" }),
      status(429, { "Retry-After": "0" }),
      status(502, { "Retry-After": "0" }),
      ok,
    ]);
    worker.use(handler);
    await alloy("configure", alloyConfig);

    await expect(alloy("sendEvent")).resolves.toBeDefined();

    expect(requests).toHaveLength(4);
  });

  test("stops retrying as soon as a non-retryable status follows a retryable one", async ({
    alloy,
    worker,
  }) => {
    const { handler, requests } = scriptedInteract([
      status(503, { "Retry-After": "0" }),
      status(500),
      ok,
    ]);
    worker.use(handler);
    await alloy("configure", alloyConfig);

    const { error } = await settle(alloy("sendEvent"));

    expect(requests).toHaveLength(2);
    expect(error.message).toContain(
      "The server responded with a status code 500",
    );
  });

  test("does not retry a network error and rejects with 'Network request failed.' caused by the fetch error", async ({
    alloy,
    worker,
  }) => {
    const { handler, requests } = scriptedInteract([networkError, ok]);
    worker.use(handler);
    await alloy("configure", alloyConfig);

    const { error } = await settle(alloy("sendEvent"));

    expect(requests).toHaveLength(1);
    expect(error.message).toMatch(/Network request failed\.\nCaused by: .+/);
  });

  test("does not retry a network error that follows a retryable response", async ({
    alloy,
    worker,
  }) => {
    const { handler, requests } = scriptedInteract([
      status(503, { "Retry-After": "0" }),
      networkError,
      ok,
    ]);
    worker.use(handler);
    await alloy("configure", alloyConfig);

    const { error } = await settle(alloy("sendEvent"));

    expect(requests).toHaveLength(2);
    expect(error.message).toContain("Network request failed.");
  });

  test("notifies onBeforeNetworkRequest once and onNetworkResponse with the number of retries attempted", async ({
    alloy,
    worker,
  }) => {
    const { handler } = scriptedInteract([
      status(503, { "Retry-After": "0" }),
      status(503, { "Retry-After": "0" }),
      ok,
    ]);
    worker.use(handler);
    const monitor = {
      onBeforeNetworkRequest: vi.fn(),
      onNetworkResponse: vi.fn(),
      onNetworkError: vi.fn(),
    };
    window.__alloyMonitors.push(monitor);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent");

    expect(monitor.onBeforeNetworkRequest).toHaveBeenCalledOnce();
    expect(monitor.onNetworkResponse).toHaveBeenCalledOnce();
    expect(monitor.onNetworkResponse).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 200, retriesAttempted: 2 }),
    );
    expect(monitor.onNetworkError).not.toHaveBeenCalled();
  });

  test("notifies onNetworkResponse with the final retryable status and retriesAttempted 3 when retries are exhausted", async ({
    alloy,
    worker,
  }) => {
    const { handler } = scriptedInteract([status(503, { "Retry-After": "0" })]);
    worker.use(handler);
    const monitor = {
      onBeforeNetworkRequest: vi.fn(),
      onNetworkResponse: vi.fn(),
      onNetworkError: vi.fn(),
    };
    window.__alloyMonitors.push(monitor);
    await alloy("configure", alloyConfig);

    await settle(alloy("sendEvent"));

    expect(monitor.onBeforeNetworkRequest).toHaveBeenCalledOnce();
    expect(monitor.onNetworkResponse).toHaveBeenCalledOnce();
    expect(monitor.onNetworkResponse).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 503, retriesAttempted: 3 }),
    );
    expect(monitor.onNetworkError).not.toHaveBeenCalled();
  });

  test("notifies onNetworkError and not onNetworkResponse when fetch rejects", async ({
    alloy,
    worker,
  }) => {
    const { handler } = scriptedInteract([networkError]);
    worker.use(handler);
    const monitor = {
      onBeforeNetworkRequest: vi.fn(),
      onNetworkResponse: vi.fn(),
      onNetworkError: vi.fn(),
    };
    window.__alloyMonitors.push(monitor);
    await alloy("configure", alloyConfig);

    await settle(alloy("sendEvent"));

    expect(monitor.onBeforeNetworkRequest).toHaveBeenCalledOnce();
    expect(monitor.onNetworkError).toHaveBeenCalledOnce();
    expect(monitor.onNetworkError).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(Error) }),
    );
    expect(monitor.onNetworkResponse).not.toHaveBeenCalled();
  });

  test("sends every retry of a documentUnloading request with keepalive", async ({
    alloy,
    worker,
  }) => {
    const { handler, requests } = scriptedInteract([
      status(503, { "Retry-After": "0" }),
      ok,
    ]);
    worker.use(handler);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent", { documentUnloading: true });

    expect(requests.map((r) => r.keepalive)).toEqual([true, true]);
  });

  test("sends retries of a regular sendEvent without keepalive", async ({
    alloy,
    worker,
  }) => {
    const { handler, requests } = scriptedInteract([
      status(503, { "Retry-After": "0" }),
      ok,
    ]);
    worker.use(handler);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent");

    expect(requests.map((r) => r.keepalive)).toEqual([false, false]);
  });

  test("does not retry a documentUnloading request sent with sendBeacon even if collect would answer 503", async ({
    alloy,
    worker,
  }) => {
    worker.use(sendEventWithIdentityCookieHandler);
    await alloy("configure", alloyConfig);
    await alloy("sendEvent");

    const collectRequests = [];
    worker.use(
      http.post(COLLECT, () => {
        collectRequests.push(Date.now());
        return status(503, { "Retry-After": "0" })();
      }),
      sendEventHandler,
    );
    resetSendBeaconCalls();

    await expect(
      alloy("sendEvent", { documentUnloading: true }),
    ).resolves.toBeDefined();

    // sendBeacon yields a synthetic 204, so there is nothing to retry and the
    // request never reaches the network layer MSW observes.
    expect(sendBeaconCalls()).toHaveLength(1);
    expect(sendBeaconCalls()[0].url).toMatch(/\/v1\/collect\?configId=/);
    expect(collectRequests).toHaveLength(0);
  });
});
