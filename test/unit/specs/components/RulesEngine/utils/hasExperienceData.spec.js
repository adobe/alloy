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

import { describe, it, expect } from "vitest";
import hasExperienceData from "../../../../../../packages/core/src/components/RulesEngine/utils/hasExperienceData.js";

describe("hasExperienceData", () => {
  it("should return true when _experience is an object", () => {
    const data = { _experience: { key: "value" } };
    expect(hasExperienceData(data)).toBe(true);
  });

  it("should return false when _experience is not an object", () => {
    const data = { _experience: "notAnObject" };
    expect(hasExperienceData(data)).toBe(false);
  });

  it("should return false when _experience is undefined", () => {
    const data = {};
    expect(hasExperienceData(data)).toBe(false);
  });

  it("should return false when data is undefined", () => {
    const data = undefined;
    expect(hasExperienceData(data)).toBe(false);
  });

  it("should return false when data is null", () => {
    const data = null;
    expect(hasExperienceData(data)).toBe(false);
  });
});
