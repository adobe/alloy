/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { vi, describe, it, expect, beforeEach } from "vitest";
import createHashedIpHandler from "../../../../../../src/components/Advertising/identities/createHashedIpHandler.js";
import { HASHED_IP_ADDR } from "../../../../../../src/components/Advertising/constants/index.js";

describe("Advertising::createHashedIpHandler", () => {
  let cookieManager;
  let hash;

  beforeEach(() => {
    cookieManager = {
      getValue: vi.fn().mockReturnValue(""),
      setValue: vi.fn(),
    };
    hash = vi.fn((ip) => `hashed_${ip}`);
  });

  it("get() returns the cached cookie value at construction time", () => {
    cookieManager.getValue.mockReturnValue("cached_hash_value");
    const handler = createHashedIpHandler({ cookieManager, hash });
    expect(handler.get()).toBe("cached_hash_value");
  });

  it("get() returns empty string when no cookie exists", () => {
    const handler = createHashedIpHandler({ cookieManager, hash });
    expect(handler.get()).toBe("");
  });

  it("captureFromIframe(undefined) is a no-op", () => {
    const handler = createHashedIpHandler({ cookieManager, hash });
    handler.captureFromIframe(undefined);
    expect(cookieManager.setValue).not.toHaveBeenCalled();
    expect(hash).not.toHaveBeenCalled();
  });

  it("captureFromIframe('') is a no-op", () => {
    const handler = createHashedIpHandler({ cookieManager, hash });
    handler.captureFromIframe("");
    expect(cookieManager.setValue).not.toHaveBeenCalled();
    expect(hash).not.toHaveBeenCalled();
  });

  it("captureFromIframe(ip) hashes the IP and writes to cache and cookie", () => {
    const handler = createHashedIpHandler({ cookieManager, hash });
    handler.captureFromIframe("192.168.1.1");
    expect(hash).toHaveBeenCalledWith("192.168.1.1");
    expect(cookieManager.setValue).toHaveBeenCalledWith(
      HASHED_IP_ADDR,
      "hashed_192.168.1.1",
    );
    expect(handler.get()).toBe("hashed_192.168.1.1");
  });

  it("collect() short-circuits and does not invoke fn when cached value exists", async () => {
    cookieManager.getValue.mockReturnValue("existing_hash");
    const handler = createHashedIpHandler({ cookieManager, hash });
    const initiateCallFn = vi.fn();

    const result = await handler.collect(initiateCallFn);

    expect(initiateCallFn).not.toHaveBeenCalled();
    expect(result).toBe("existing_hash");
  });

  it("collect() invokes fn, hashes clientIp, and resolves with hashed value", async () => {
    const handler = createHashedIpHandler({ cookieManager, hash });
    const initiateCallFn = vi
      .fn()
      .mockResolvedValue({ clientIp: "10.0.0.1", surferId: null });

    const result = await handler.collect(initiateCallFn);

    expect(initiateCallFn).toHaveBeenCalled();
    expect(hash).toHaveBeenCalledWith("10.0.0.1");
    expect(result).toBe("hashed_10.0.0.1");
    expect(cookieManager.setValue).toHaveBeenCalledWith(
      HASHED_IP_ADDR,
      "hashed_10.0.0.1",
    );
  });

  it("collect() resolves with empty string when clientIp is absent", async () => {
    const handler = createHashedIpHandler({ cookieManager, hash });
    const initiateCallFn = vi
      .fn()
      .mockResolvedValue({ clientIp: "", surferId: null });

    const result = await handler.collect(initiateCallFn);

    expect(hash).not.toHaveBeenCalled();
    expect(result).toBe("");
  });
});
