/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { vi, describe, it, expect } from "vitest";
import getExpirationDate from "../../../../../../src/components/RulesEngine/utils/getExpirationDate.js";

describe("getExpirationDate", () => {
  it("should return the date of expiration", () => {
    const mockedTimestamp = new Date(Date.UTC(2023, 8, 2, 13, 34, 56));
    vi.useFakeTimers();
    vi.setSystemTime(mockedTimestamp);

    const retentionPeriod = 10;
    const expectedDate = new Date(mockedTimestamp);
    expectedDate.setDate(expectedDate.getDate() - retentionPeriod);
    const result = getExpirationDate(retentionPeriod);
    expect(result).toEqual(expectedDate);

    vi.useRealTimers();
  });
});
