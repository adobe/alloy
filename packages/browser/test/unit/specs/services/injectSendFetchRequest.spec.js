/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { vi, beforeEach, describe, it, expect } from "vitest";
import injectSendFetchRequest from "../../../../src/services/injectSendFetchRequest.js";

describe("injectSendFetchRequest", () => {
  const url = "http://example.com/endpoint";
  const body = '{"a":"b"}';
  let logger;
  let fetchResult;

  beforeEach(() => {
    logger = { info: vi.fn() };
    fetchResult = {
      status: 999,
      headers: {
        get: vi.fn().mockReturnValue("headervalue"),
      },
      text() {
        return Promise.resolve("content");
      },
    };
  });

  it("resolves returned promise upon network success", () => {
    const fetch = vi.fn().mockReturnValue(Promise.resolve(fetchResult));
    const sendFetchRequest = injectSendFetchRequest({
      fetch,
      logger,
    });
    return sendFetchRequest(url, body).then((result) => {
      expect(result.statusCode).toBe(999);
      expect(result.getHeader("Content-Type")).toBe("headervalue");
      expect(result.body).toBe("content");
      expect(fetchResult.headers.get).toHaveBeenCalledWith("Content-Type");
    });
  });

  it("rejects returned promise upon network failure", async () => {
    const fetch = vi
      .fn()
      .mockReturnValue(Promise.reject(new Error("No connection")));
    const sendFetchRequest = injectSendFetchRequest({
      fetch,
      logger,
    });
    await expect(sendFetchRequest(url, body)).rejects.toThrow("No connection");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(logger.info).not.toHaveBeenCalled();
  });

  it("does not use keepalive by default", async () => {
    const fetch = vi.fn().mockReturnValue(Promise.resolve(fetchResult));
    const sendFetchRequest = injectSendFetchRequest({ fetch, logger });
    await sendFetchRequest(url, body);
    expect(fetch.mock.calls[0][1]).not.toHaveProperty("keepalive");
  });

  it("uses keepalive when requested", async () => {
    const fetch = vi.fn().mockReturnValue(Promise.resolve(fetchResult));
    const sendFetchRequest = injectSendFetchRequest({ fetch, logger });
    const result = await sendFetchRequest(url, body, undefined, {
      keepalive: true,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      url,
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body,
        keepalive: true,
      }),
    );
    expect(result.body).toBe("content");
    expect(logger.info).not.toHaveBeenCalled();
  });

  it("falls back to a regular fetch when the keepalive fetch is rejected", async () => {
    // This is how browsers reject a keepalive request over the 64 KiB quota.
    const fetch = vi
      .fn()
      .mockReturnValueOnce(Promise.reject(new TypeError("Failed to fetch")))
      .mockReturnValueOnce(Promise.resolve(fetchResult));
    const sendFetchRequest = injectSendFetchRequest({ fetch, logger });
    const headers = { "x-test": "1" };
    const result = await sendFetchRequest(url, body, headers, {
      keepalive: true,
    });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[0][1]).toHaveProperty("keepalive", true);
    expect(fetch.mock.calls[1][1]).not.toHaveProperty("keepalive");
    expect(fetch.mock.calls[1][0]).toBe(url);
    expect(fetch.mock.calls[1][1]).toEqual(
      expect.objectContaining({
        body,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8",
          "x-test": "1",
        },
      }),
    );
    expect(logger.info).toHaveBeenCalledWith(
      "Unable to send the request with `keepalive`; falling back to a regular `fetch`.",
    );
    expect(result.statusCode).toBe(999);
    expect(result.body).toBe("content");
  });

  it("rejects when the fallback fetch also fails", async () => {
    const fetch = vi
      .fn()
      .mockReturnValueOnce(Promise.reject(new TypeError("Failed to fetch")))
      .mockReturnValueOnce(Promise.reject(new TypeError("Offline")));
    const sendFetchRequest = injectSendFetchRequest({ fetch, logger });
    await expect(
      sendFetchRequest(url, body, undefined, { keepalive: true }),
    ).rejects.toThrow("Offline");
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("does not resend the request when reading the keepalive response fails", async () => {
    fetchResult.text = () => Promise.reject(new TypeError("Body read failed"));
    const fetch = vi.fn().mockReturnValue(Promise.resolve(fetchResult));
    const sendFetchRequest = injectSendFetchRequest({ fetch, logger });
    await expect(
      sendFetchRequest(url, body, undefined, { keepalive: true }),
    ).rejects.toThrow("Body read failed");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(logger.info).not.toHaveBeenCalled();
  });
});
