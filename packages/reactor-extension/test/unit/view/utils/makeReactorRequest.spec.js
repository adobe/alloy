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

import makeReactorRequest from "../../../../src/view/utils/makeReactorRequest";
import UserReportableError from "../../../../src/view/errors/userReportableError";

const fetchMock = vi.fn();

const okResponse = (body, status = 200) => ({
  ok: true,
  status,
  json: async () => body,
});

const errorResponse = (status, body = {}) => ({
  ok: false,
  status,
  json: async () => body,
});

describe("makeReactorRequest", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("defaults to GET and forwards path, params, and auth headers", async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ data: { id: "X" } }));

    await makeReactorRequest({
      orgId: "ORG",
      imsAccess: "TOKEN",
      path: "/data_elements/DE1",
      params: new URLSearchParams({ "page[size]": "10" }),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://reactor.adobe.io/data_elements/DE1?page%5Bsize%5D=10",
    );
    expect(options.method).toBe("GET");
    expect(options.headers).toMatchObject({
      "x-api-key": "Activation-DTM",
      "x-gw-ims-org-id": "ORG",
      Authorization: "Bearer TOKEN",
      Accept: "application/vnd.api+json;revision=1",
    });
    expect(options.body).toBeUndefined();
  });

  it("serializes a body and sends JSON:API Content-Type for PATCH", async () => {
    fetchMock.mockResolvedValueOnce(okResponse({ data: { id: "X" } }));

    await makeReactorRequest({
      orgId: "ORG",
      imsAccess: "TOKEN",
      method: "PATCH",
      path: "/rule_components/RC1",
      body: { data: { id: "RC1", type: "rule_components" } },
    });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("PATCH");
    // JSON:API: Content-Type for request bodies must be the bare media type
    // (no parameters). Accept may include the `;revision=1` selector.
    expect(options.headers["Content-Type"]).toBe("application/vnd.api+json");
    expect(options.headers.Accept).toBe("application/vnd.api+json;revision=1");
    expect(options.body).toBe(
      JSON.stringify({ data: { id: "RC1", type: "rule_components" } }),
    );
  });

  it("returns parsedBody: null for 204 No Content without calling json()", async () => {
    const jsonSpy = vi.fn();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: jsonSpy,
    });

    const result = await makeReactorRequest({
      orgId: "ORG",
      imsAccess: "TOKEN",
      method: "PATCH",
      path: "/rule_components/RC1",
      body: { data: {} },
    });

    expect(jsonSpy).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 204, parsedBody: null });
  });

  it("maps 404 to RESOURCE_NOT_FOUND", async () => {
    fetchMock.mockResolvedValueOnce(errorResponse(404));

    await expect(
      makeReactorRequest({
        orgId: "ORG",
        imsAccess: "TOKEN",
        path: "/x",
      }),
    ).rejects.toMatchObject({
      message: "The resource was not found.",
      constructor: UserReportableError,
    });
  });

  it("maps 401 to INVALID_ACCESS_TOKEN", async () => {
    fetchMock.mockResolvedValueOnce(errorResponse(401));

    await expect(
      makeReactorRequest({ orgId: "ORG", imsAccess: "TOKEN", path: "/x" }),
    ).rejects.toMatchObject({
      message: expect.stringContaining("access token appears to be invalid"),
    });
  });

  it("maps 403 to FORBIDDEN_ACCESS", async () => {
    fetchMock.mockResolvedValueOnce(errorResponse(403));

    await expect(
      makeReactorRequest({ orgId: "ORG", imsAccess: "TOKEN", path: "/x" }),
    ).rejects.toMatchObject({
      message: expect.stringContaining("permissions to access"),
    });
  });

  it("wraps generic network failures in UNABLE_TO_CONNECT_TO_SERVER", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(
      makeReactorRequest({ orgId: "ORG", imsAccess: "TOKEN", path: "/x" }),
    ).rejects.toMatchObject({
      message: expect.stringContaining("connection to the server"),
    });
  });

  it("rethrows AbortError unwrapped", async () => {
    const abortError = Object.assign(new Error("aborted"), {
      name: "AbortError",
    });
    fetchMock.mockRejectedValueOnce(abortError);

    await expect(
      makeReactorRequest({ orgId: "ORG", imsAccess: "TOKEN", path: "/x" }),
    ).rejects.toBe(abortError);
  });

  it("wraps unexpected non-2xx responses as UNEXPECTED_SERVER_RESPONSE", async () => {
    fetchMock.mockResolvedValueOnce(errorResponse(500, { errors: [] }));

    await expect(
      makeReactorRequest({ orgId: "ORG", imsAccess: "TOKEN", path: "/x" }),
    ).rejects.toMatchObject({
      message: "An unexpected server response was received.",
    });
  });
});
