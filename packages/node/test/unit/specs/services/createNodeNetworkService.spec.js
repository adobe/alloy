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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import createNodeNetworkService from "../../../../src/services/createNodeNetworkService.js";

const okResponse = (body, headers = {}) =>
  new Response(body, { status: 200, headers });

describe("createNodeNetworkService", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sendFetchRequest POSTs the body as text/plain and maps the response", async () => {
    fetchMock.mockResolvedValueOnce(
      okResponse("response body", { "x-adobe-edge": "region" }),
    );
    const { sendFetchRequest } = createNodeNetworkService();

    const response = await sendFetchRequest("https://example.com", "payload");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com",
      expect.objectContaining({
        method: "POST",
        body: "payload",
        headers: { "Content-Type": "text/plain; charset=UTF-8" },
      }),
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("response body");
    expect(response.getHeader("x-adobe-edge")).toBe("region");
  });

  it("sendBeaconRequest is the same fetch-based strategy — Node has no navigator.sendBeacon", async () => {
    fetchMock.mockResolvedValueOnce(okResponse(""));
    const { sendFetchRequest, sendBeaconRequest } = createNodeNetworkService();

    expect(sendBeaconRequest).toBe(sendFetchRequest);
  });
});
