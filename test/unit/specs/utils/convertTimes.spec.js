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

import convertTimes, {
  MILLISECOND,
  SECOND,
  MINUTE,
  HOUR,
  DAY,
  WEEK,
  MONTH,
  YEAR
} from "../../../../src/utils/convertTimes";

describe("convertTimes", () => {
  it("exposes unit values", () => {
    expect(MILLISECOND).toBe(1);
    expect(SECOND).toBe(1000);
    expect(MINUTE).toBe(60000);
    expect(HOUR).toBe(3600000);
    expect(DAY).toBe(86400000);
    expect(WEEK).toBe(604800000);
    expect(MONTH).toBe(2592000000);
    expect(YEAR).toBe(31536000000);
  });

  it("converts from a unit to a larger unit", () => {
    expect(convertTimes(SECOND, MONTH, 3888000)).toBe(1.5);
  });

  it("converts from a unit to a smaller unit", () => {
    expect(convertTimes(MONTH, SECOND, 1.5)).toBe(3888000);
  });
});
