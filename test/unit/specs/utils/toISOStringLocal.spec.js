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
import { toISOStringLocal } from "../../../../src/utils";

describe("toISOStringLocal", () => {
  it("handles a date in Utah", () => {
    const date = new Date("August 9, 2019 10:59:42.000");
    spyOn(date, "getTimezoneOffset").and.returnValue(7 * 60);
    expect(toISOStringLocal(date)).toEqual("2019-08-09T10:59:42.000-07:00");
  });

  it("handles a date in india", () => {
    const date = new Date("December 31, 2019 22:36:00.001");
    spyOn(date, "getTimezoneOffset").and.returnValue(-5 * 60 - 30);
    expect(toISOStringLocal(date)).toEqual("2019-12-31T22:36:00.001+05:30");
  });

  it("handles a weird offset", () => {
    const date = new Date("January 01, 2020 00:00:42.012");
    spyOn(date, "getTimezoneOffset").and.returnValue(-176);
    expect(toISOStringLocal(date)).toEqual("2020-01-01T00:00:42.012+02:56");
  });

  it("handles a UTC timezone", () => {
    const date = new Date("December 31, 2019 22:36:00.123");
    spyOn(date, "getTimezoneOffset").and.returnValue(0);
    expect(toISOStringLocal(date)).toEqual("2019-12-31T22:36:00.123+00:00");
  });
});
