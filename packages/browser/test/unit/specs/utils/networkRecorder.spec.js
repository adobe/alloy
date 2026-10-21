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

import { afterEach, describe, expect, it } from "vitest";
import { networkRecorder } from "../../../integration/helpers/mswjs/networkRecorder.js";

describe("networkRecorder", () => {
  afterEach(() => {
    networkRecorder.reset();
  });

  it.each(["request", "response"])(
    "waits for both bodies when the %s capture finishes last",
    async (lastCapture) => {
      let resolveBody;
      const delayedBody = new Promise((resolve) => {
        resolveBody = resolve;
      });
      const body = '{"captured":true}';
      const request = {
        url: "https://edge.adobedc.net/ee/test/v1/interact",
        method: "POST",
        referrer: "",
        headers: new Headers(),
        clone: () => ({
          text: () =>
            lastCapture === "request" ? delayedBody : Promise.resolve(body),
        }),
      };
      const response = {
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        clone: () => ({
          text: () =>
            lastCapture === "response" ? delayedBody : Promise.resolve(body),
        }),
      };
      const pendingCall = networkRecorder.waitForCall(/v1\/interact/);
      let resolved = false;
      pendingCall.then(() => {
        resolved = true;
      });
      const captureRequest = networkRecorder.captureRequest({
        request,
        requestId: "delayed",
      });
      const captureResponse = networkRecorder.captureResponse({
        requestId: "delayed",
        response,
      });

      await (lastCapture === "request" ? captureResponse : captureRequest);
      expect(resolved).toBe(false);

      resolveBody(body);
      await Promise.all([captureRequest, captureResponse]);

      await expect(pendingCall).resolves.toMatchObject({
        request: { url: request.url, body: { captured: true } },
        response: { status: 200, body: { captured: true } },
      });
    },
  );

  it("ignores captures that finish after reset", async () => {
    let resolveRequestBody;
    let resolveResponseBody;
    const requestBody = new Promise((resolve) => {
      resolveRequestBody = resolve;
    });
    const responseBody = new Promise((resolve) => {
      resolveResponseBody = resolve;
    });
    const request = {
      url: "https://edge.adobedc.net/ee/test/v1/interact?configId=old",
      method: "POST",
      referrer: "",
      headers: new Headers(),
      clone: () => ({ text: () => requestBody }),
    };
    const response = {
      status: 200,
      statusText: "OK",
      headers: new Headers(),
      clone: () => ({ text: () => responseBody }),
    };

    const captureRequest = networkRecorder.captureRequest({
      request,
      requestId: "old",
    });
    const captureResponse = networkRecorder.captureResponse({
      requestId: "old",
      response,
    });

    networkRecorder.reset();
    const nextCall = networkRecorder.waitForCall(/v1\/interact/, {
      timeoutMs: 20,
    });
    resolveRequestBody("{}");
    resolveResponseBody("{}");

    await Promise.all([captureRequest, captureResponse]);
    await expect(nextCall).resolves.toBeUndefined();
    expect(networkRecorder.calls).toEqual([]);
  });

  it("settles pending waiters when reset", async () => {
    const pendingCall = networkRecorder.waitForCall(/v1\/interact/, {
      timeoutMs: 1000,
    });

    networkRecorder.reset();

    await expect(
      Promise.race([
        pendingCall,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("waiter was not settled")), 20);
        }),
      ]),
    ).resolves.toBeUndefined();
  });
});
