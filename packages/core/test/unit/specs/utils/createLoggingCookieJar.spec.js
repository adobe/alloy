/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { vi, beforeEach, describe, it, expect } from "vitest";
import createLoggingCookieJar from "../../../../src/utils/createLoggingCookieJar.js";

describe("loggingCookieJar", () => {
  let cookieJar;
  let logger;
  let loggingCookieJar;
  beforeEach(() => {
    cookieJar = {
      set: vi.fn(),
      get: vi.fn(),
    };
    logger = {
      info: vi.fn(),
    };
    loggingCookieJar = createLoggingCookieJar({
      cookieJar,
      logger,
    });
  });
  it("logs a message", () => {
    loggingCookieJar.set("mykey", "myvalue", {
      myoption: "myoptionvalue",
    });
    expect(logger.info).toHaveBeenNthCalledWith(1, "Setting cookie", {
      name: "mykey",
      value: "myvalue",
      myoption: "myoptionvalue",
    });
  });
  it("calls set", () => {
    loggingCookieJar.set("mykey", "myvalue", {
      myoption: "myoptionvalue",
    });
    expect(cookieJar.set).toHaveBeenNthCalledWith(1, "mykey", "myvalue", {
      myoption: "myoptionvalue",
    });
  });
  it("calls get", () => {
    loggingCookieJar.get("mykey");
    expect(cookieJar.get).toHaveBeenNthCalledWith(1, "mykey");
  });
  it("returns the value from get", () => {
    cookieJar.get.mockReturnValue("myvalue");
    expect(loggingCookieJar.get("mykey")).toEqual("myvalue");
  });
});
