/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import getRequestRetryDelay from "../../../../../src/core/network/getRequestRetryDelay.js";

describe("getRequestRetryDelay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it("returns value derived from retry-after header in delay-seconds format", () => {
    const response = {
      getHeader: vi.fn().mockReturnValue("123"),
    };
    const delay = getRequestRetryDelay({
      response,
      retriesAttempted: 0,
    });
    expect(delay).toBe(123000);
    expect(response.getHeader).toHaveBeenCalledWith("Retry-After");
  });
  it("returns value derived from retry-after header in http-date format in the future", () => {
    const response = {
      getHeader: vi.fn().mockReturnValue("Thu, 01 Jan 1970 00:00:09 GMT"),
    };
    const delay = getRequestRetryDelay({
      response,
      retriesAttempted: 0,
    });
    expect(delay).toBe(9000);
    expect(response.getHeader).toHaveBeenCalledWith("Retry-After");
  });
  it("returns value derived from retry-after header exists in http-date format in the past", () => {
    const response = {
      getHeader: vi.fn().mockReturnValue("Thu, 01 Jan 1969 11:59:51 GMT"),
    };
    const delay = getRequestRetryDelay({
      response,
      retriesAttempted: 0,
    });
    expect(delay).toBe(0);
    expect(response.getHeader).toHaveBeenCalledWith("Retry-After");
  });
  const retriesAttemptedScenarios = [
    {
      retriesAttempted: 0,
      lowDelay: 700,
      highDelay: 1300,
    },
    {
      retriesAttempted: 1,
      lowDelay: 1400,
      highDelay: 2600,
    },
    {
      retriesAttempted: 2,
      lowDelay: 2100,
      highDelay: 3900,
    },
    {
      retriesAttempted: 3,
      lowDelay: 2800,
      highDelay: 5200,
    },
  ];
  retriesAttemptedScenarios.forEach((scenario) => {
    it(`returns randomized, incremental value based on ${scenario.retriesAttempted} retries attempted`, () => {
      vi.spyOn(Math, "random");
      const response = {
        getHeader: vi.fn(),
      };
      Math.random.mockReturnValue(0);
      const lowDelay = getRequestRetryDelay({
        response,
        retriesAttempted: scenario.retriesAttempted,
      });
      expect(lowDelay).toBe(scenario.lowDelay);
      Math.random.mockReturnValue(0.999999999999);
      const highDelay = getRequestRetryDelay({
        response,
        retriesAttempted: scenario.retriesAttempted,
      });
      expect(highDelay).toBe(scenario.highDelay);
    });
  });
});
