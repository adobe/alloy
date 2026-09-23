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

import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import injectGetImsAccessToken from "../../../../../src/core/edgeNetwork/injectGetImsAccessToken.js";

const edgeCredentials = {
  clientId: "myClientId",
  clientSecret: "myClientSecret",
  scopes: ["openid", "AdobeID"],
  imsHost: "ims-na1.adobelogin.com",
};

const okTokenResponse = (overrides = {}) =>
  new Response(
    JSON.stringify({
      access_token: "the-access-token",
      token_type: "bearer",
      expires_in: 86399,
      ...overrides,
    }),
    { status: 200 },
  );

describe("injectGetImsAccessToken", () => {
  let fetchMock;
  let dateProvider;
  let now;

  beforeEach(() => {
    now = new Date("2026-01-01T00:00:00.000Z");
    dateProvider = () => now;
    fetchMock = vi.fn().mockImplementation(async () => okTokenResponse());
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exchanges credentials for an access token via the IMS v3 token endpoint", async () => {
    const { getAccessToken } = injectGetImsAccessToken({
      edgeCredentials,
      dateProvider,
    });

    const token = await getAccessToken();

    expect(token).toBe("the-access-token");
    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toBe("https://ims-na1.adobelogin.com/ims/token/v3");
    expect(requestInit.method).toBe("POST");
    expect(requestInit.headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    );
    const body = new URLSearchParams(requestInit.body);
    expect(body.get("grant_type")).toBe("client_credentials");
    expect(body.get("client_id")).toBe("myClientId");
    expect(body.get("client_secret")).toBe("myClientSecret");
    expect(body.get("scope")).toBe("openid,AdobeID");
  });

  it("caches the token instead of fetching a new one on every call", async () => {
    const { getAccessToken } = injectGetImsAccessToken({
      edgeCredentials,
      dateProvider,
    });

    await getAccessToken();
    await getAccessToken();
    await getAccessToken();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("dedupes concurrent calls while a fetch is already in flight", async () => {
    let resolveFetch;
    fetchMock.mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = () => resolve(okTokenResponse());
      }),
    );
    const { getAccessToken } = injectGetImsAccessToken({
      edgeCredentials,
      dateProvider,
    });

    const first = getAccessToken();
    const second = getAccessToken();
    resolveFetch();
    const [token1, token2] = await Promise.all([first, second]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(token1).toBe("the-access-token");
    expect(token2).toBe("the-access-token");
  });

  it("fetches a new token once the cached one is past its expiry", async () => {
    const { getAccessToken } = injectGetImsAccessToken({
      edgeCredentials,
      dateProvider,
    });

    await getAccessToken();
    // expires_in is 86399s; advance well past that.
    now = new Date(now.getTime() + 86400 * 1000);
    await getAccessToken();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("refreshes before the real expiry, per Adobe's own rotate-early guidance", async () => {
    const { getAccessToken } = injectGetImsAccessToken({
      edgeCredentials,
      dateProvider,
    });

    await getAccessToken();
    // Still technically 4 minutes before the real 86399s expiry, but inside
    // the safety margin.
    now = new Date(now.getTime() + (86399 - 4 * 60) * 1000);
    await getAccessToken();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects when IMS responds with a non-2xx status", async () => {
    fetchMock.mockResolvedValue(
      new Response("invalid_client", { status: 401 }),
    );
    const { getAccessToken } = injectGetImsAccessToken({
      edgeCredentials,
      dateProvider,
    });

    await expect(getAccessToken()).rejects.toThrow(/401/);
  });
});
