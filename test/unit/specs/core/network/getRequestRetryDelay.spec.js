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

import getRequestRetryDelay from "../../../../../src/core/network/getRequestRetryDelay.js";

describe("getRequestRetryDelay", () => {
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(0));
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it("returns value derived from retry-after header in delay-seconds format", () => {
    const response = jasmine.createSpyObj("request", {
      getHeader: "123"
    });
    const delay = getRequestRetryDelay({
      response,
      retriesAttempted: 0
    });
    expect(delay).toBe(123000);
    expect(response.getHeader).toHaveBeenCalledWith("Retry-After");
  });

  it("returns value derived from retry-after header in http-date format in the future", () => {
    const response = jasmine.createSpyObj("request", {
      getHeader: "Thu, 01 Jan 1970 00:00:09 GMT"
    });
    const delay = getRequestRetryDelay({
      response,
      retriesAttempted: 0
    });
    expect(delay).toBe(9000);
    expect(response.getHeader).toHaveBeenCalledWith("Retry-After");
  });

  it("returns value derived from retry-after header exists in http-date format in the past", () => {
    const response = jasmine.createSpyObj("request", {
      getHeader: "Thu, 01 Jan 1969 11:59:51 GMT"
    });
    const delay = getRequestRetryDelay({
      response,
      retriesAttempted: 0
    });
    expect(delay).toBe(0);
    expect(response.getHeader).toHaveBeenCalledWith("Retry-After");
  });

  const retriesAttemptedScenarios = [
    {
      retriesAttempted: 0,
      lowDelay: 700,
      highDelay: 1300
    },
    {
      retriesAttempted: 1,
      lowDelay: 1400,
      highDelay: 2600
    },
    {
      retriesAttempted: 2,
      lowDelay: 2100,
      highDelay: 3900
    },
    {
      retriesAttempted: 3,
      lowDelay: 2800,
      highDelay: 5200
    }
  ];

  retriesAttemptedScenarios.forEach(scenario => {
    it(`returns randomized, incremental value based on ${scenario.retriesAttempted} retries attempted`, () => {
      spyOn(Math, "random");
      const response = jasmine.createSpyObj("request", ["getHeader"]);

      Math.random.and.returnValue(0);
      const lowDelay = getRequestRetryDelay({
        response,
        retriesAttempted: scenario.retriesAttempted
      });
      expect(lowDelay).toBe(scenario.lowDelay);

      Math.random.and.returnValue(0.999999999999);
      const highDelay = getRequestRetryDelay({
        response,
        retriesAttempted: scenario.retriesAttempted
      });
      expect(highDelay).toBe(scenario.highDelay);
    });
  });
});
