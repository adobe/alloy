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
import alloyConfig from "../../helpers/alloy/config.js";
import searchForLogMessage from "../../helpers/utils/searchForLogMessage.js";

const EDGE_INTERACT = /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/interact/;
const DEMDEX_INTERACT = /https:\/\/adobedc\.demdex\.net\/ee\/.*\/?v1\/interact/;

const ok = () => HttpResponse.json({ requestId: "ok", handle: [] });
const networkError = () => HttpResponse.error();

const recordedHandler = (pattern, respond) => {
  const requests = [];
  const handler = http.post(pattern, ({ request }) => {
    requests.push(request.url);
    return respond();
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

const interactWith = (response) => (worker) =>
  worker.use(http.post(EDGE_INTERACT, () => response()));

const SEND_EVENT_FAILED =
  "[alloy] [DataCollector] An error occurred while executing the sendEvent command.\nCaused by: ";

const COOKIE_KEY = "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_cluster";

describe("demdex fallback of sendEvent", () => {
  const thirdPartyConfig = { ...alloyConfig, thirdPartyCookiesEnabled: true };

  test("retries once against the edge domain when the demdex request fails with a network error", async ({
    alloy,
    worker,
  }) => {
    const demdex = recordedHandler(DEMDEX_INTERACT, networkError);
    const edge = recordedHandler(EDGE_INTERACT, ok);
    worker.use(demdex.handler, edge.handler);
    await alloy("configure", thirdPartyConfig);

    await expect(alloy("sendEvent")).resolves.toBeDefined();

    expect(demdex.requests).toHaveLength(1);
    expect(edge.requests).toHaveLength(1);
  });

  test("sends later events straight to the edge domain after a demdex failure", async ({
    alloy,
    worker,
  }) => {
    const demdex = recordedHandler(DEMDEX_INTERACT, networkError);
    const edge = recordedHandler(EDGE_INTERACT, ok);
    worker.use(demdex.handler, edge.handler);
    await alloy("configure", thirdPartyConfig);

    await alloy("sendEvent");
    await alloy("sendEvent");

    expect(demdex.requests).toHaveLength(1);
    expect(edge.requests).toHaveLength(2);
  });

  test("rejects with 'Network request failed.' when the edge fallback also fails, without a third attempt", async ({
    alloy,
    worker,
  }) => {
    const demdex = recordedHandler(DEMDEX_INTERACT, networkError);
    const edge = recordedHandler(EDGE_INTERACT, networkError);
    worker.use(demdex.handler, edge.handler);
    await alloy("configure", thirdPartyConfig);

    const { error } = await settle(alloy("sendEvent"));

    expect(error.message).toMatch(
      /^\[alloy\] \[DataCollector\] An error occurred while executing the sendEvent command\.\nCaused by: Network request failed\.\nCaused by: .+/,
    );
    expect(demdex.requests).toHaveLength(1);
    expect(edge.requests).toHaveLength(1);
  });

  test("leaves a later event pending without any request after the edge fallback failed", async ({
    alloy,
    worker,
  }) => {
    const demdex = recordedHandler(DEMDEX_INTERACT, networkError);
    const edge = recordedHandler(EDGE_INTERACT, networkError);
    worker.use(demdex.handler, edge.handler);
    await alloy("configure", thirdPartyConfig);
    await settle(alloy("sendEvent"));

    const later = alloy("sendEvent").then(
      () => "settled",
      () => "settled",
    );
    for (let i = 0; i < 20; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await Promise.resolve();
    }

    expect(await Promise.race([later, Promise.resolve("pending")])).toBe(
      "pending",
    );
    expect(demdex.requests).toHaveLength(1);
    expect(edge.requests).toHaveLength(1);
  });

  test("does not fall back to the edge domain when the demdex request gets an HTTP error status", async ({
    alloy,
    worker,
  }) => {
    const demdex = recordedHandler(DEMDEX_INTERACT, () =>
      HttpResponse.json({ errors: [] }, { status: 400 }),
    );
    const edge = recordedHandler(EDGE_INTERACT, ok);
    worker.use(demdex.handler, edge.handler);
    await alloy("configure", thirdPartyConfig);

    const { error } = await settle(alloy("sendEvent"));

    expect(error.message).toContain("status code 400");
    expect(edge.requests).toHaveLength(0);
  });
});

describe("resolved value of sendEvent", () => {
  test("resolves with empty decisions, destinations and propositions for a 204 response", async ({
    alloy,
    worker,
  }) => {
    interactWith(() => new HttpResponse(null, { status: 204 }))(worker);
    await alloy("configure", alloyConfig);

    await expect(alloy("sendEvent")).resolves.toEqual({
      decisions: [],
      destinations: [],
      propositions: [],
    });
  });

  test("resolves with empty decisions, destinations and propositions when the response has no handles", async ({
    alloy,
    worker,
  }) => {
    interactWith(ok)(worker);
    await alloy("configure", alloyConfig);

    await expect(alloy("sendEvent")).resolves.toEqual({
      decisions: [],
      destinations: [],
      propositions: [],
    });
  });

  test("resolves with propositions from a personalization:decisions handle", async ({
    alloy,
    worker,
  }) => {
    interactWith(() =>
      HttpResponse.json({
        requestId: "ok",
        handle: [
          {
            type: "personalization:decisions",
            eventIndex: 0,
            payload: [
              {
                id: "proposition-id",
                scope: "__view__",
                scopeDetails: { decisionProvider: "TGT" },
                items: [],
              },
            ],
          },
        ],
      }),
    )(worker);
    await alloy("configure", alloyConfig);

    const result = await alloy("sendEvent");

    expect(Array.isArray(result.propositions)).toBe(true);
    expect(result.propositions.map(({ id }) => id)).toContain("proposition-id");
  });
});

describe("warnings and non-fatal errors in a response body", () => {
  test("logs each warning and non-fatal error and still resolves", async ({
    alloy,
    worker,
  }) => {
    interactWith(() =>
      HttpResponse.json({
        requestId: "ok",
        handle: [],
        warnings: [{ code: "W-1", message: "careful" }],
        errors: [{ code: "E-1", message: "oops" }],
      }),
    )(worker);
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    await alloy("configure", { ...alloyConfig, debugEnabled: true });

    await expect(alloy("sendEvent")).resolves.toBeDefined();

    expect(
      searchForLogMessage(warn, "The server responded with a warning:"),
    ).toBe(true);
    expect(
      searchForLogMessage(
        error,
        "The server responded with a non-fatal error:",
      ),
    ).toBe(true);
  });

  test("resolves a 207 response whose handle is an array", async ({
    alloy,
    worker,
  }) => {
    interactWith(() =>
      HttpResponse.json(
        { requestId: "ok", handle: [], errors: [{ code: "E-1" }] },
        { status: 207 },
      ),
    )(worker);
    await alloy("configure", alloyConfig);

    await expect(alloy("sendEvent")).resolves.toEqual({
      decisions: [],
      destinations: [],
      propositions: [],
    });
  });
});

describe("unusable responses to sendEvent", () => {
  const body = { requestId: "bad", errors: [{ code: "E-1" }] };

  test.for([207, 500])(
    "rejects a %i response without a handle array, quoting the pretty-printed body",
    async (status, { alloy, worker }) => {
      interactWith(() => HttpResponse.json(body, { status }))(worker);
      await alloy("configure", alloyConfig);

      const { error } = await settle(alloy("sendEvent"));

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        `${SEND_EVENT_FAILED}The server responded with a status code ${status} and response body:\n${JSON.stringify(body, null, 2)}`,
      );
    },
  );

  test("rejects a 200 response whose handle is not an array", async ({
    alloy,
    worker,
  }) => {
    interactWith(() => HttpResponse.json({ handle: "nope" }))(worker);
    await alloy("configure", alloyConfig);

    const { error } = await settle(alloy("sendEvent"));

    expect(error.message).toBe(
      `${SEND_EVENT_FAILED}The server responded with a status code 200 and response body:\n${JSON.stringify({ handle: "nope" }, null, 2)}`,
    );
  });

  test("rejects a non-JSON body quoting it verbatim", async ({
    alloy,
    worker,
  }) => {
    interactWith(() =>
      HttpResponse.text("<html>gateway</html>", { status: 500 }),
    )(worker);
    await alloy("configure", alloyConfig);

    const { error } = await settle(alloy("sendEvent"));

    expect(error.message).toBe(
      `${SEND_EVENT_FAILED}The server responded with a status code 500 and response body:\n<html>gateway</html>`,
    );
  });

  test("rejects an empty 200 response saying there is no response body", async ({
    alloy,
    worker,
  }) => {
    interactWith(() => new HttpResponse(null, { status: 200 }))(worker);
    await alloy("configure", alloyConfig);

    const { error } = await settle(alloy("sendEvent"));

    expect(error.message).toBe(
      `${SEND_EVENT_FAILED}The server responded with a status code 200 and no response body.`,
    );
  });
});

describe("applyResponse command", () => {
  test("resolves with propositions from the given responseBody without any network request", async ({
    alloy,
    networkRecorder,
  }) => {
    await alloy("configure", alloyConfig);
    networkRecorder.reset();

    const result = await alloy("applyResponse", {
      responseBody: {
        requestId: "local",
        handle: [
          {
            type: "personalization:decisions",
            eventIndex: 0,
            payload: [
              {
                id: "local-proposition",
                scope: "__view__",
                scopeDetails: { decisionProvider: "TGT" },
                items: [],
              },
            ],
          },
        ],
      },
    });

    expect(result.propositions.map(({ id }) => id)).toContain(
      "local-proposition",
    );
    expect(networkRecorder.calls).toHaveLength(0);
  });

  test("rejects a responseBody whose handle is not an array", async ({
    alloy,
    networkRecorder,
  }) => {
    await alloy("configure", alloyConfig);
    networkRecorder.reset();

    const { error } = await settle(
      alloy("applyResponse", { responseBody: { handle: "nope" } }),
    );

    expect(error.message).toContain(
      'responseBody.handle\': Expected an array, but got "nope"',
    );
    expect(networkRecorder.calls).toHaveLength(0);
  });
});

describe("state:store round trip", () => {
  test("writes a state:store handle to a cookie and sends it in meta.state.entries of the next request", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    interactWith(() =>
      HttpResponse.json({
        requestId: "ok",
        handle: [
          {
            type: "state:store",
            payload: [{ key: COOKIE_KEY, value: "or2", maxAge: 1800 }],
          },
        ],
      }),
    )(worker);
    await alloy("configure", alloyConfig);

    await alloy("sendEvent");
    expect(document.cookie).toContain(`${COOKIE_KEY}=or2`);

    networkRecorder.reset();
    await alloy("sendEvent");

    const call = await networkRecorder.findCall(EDGE_INTERACT);
    expect(call.request.body.meta.state.entries).toContainEqual({
      key: COOKIE_KEY,
      value: "or2",
    });
  });
});
