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

import {
  isNotEqSelector,
  splitWithEq
} from "../../../../../../../src/components/Personalization/dom-actions/dom/helperForEq";

describe("Personalization::DOM::helperForEq::isNotEqSelector", () => {
  it("should match when no eq", () => {
    const selector = "#id";

    expect(isNotEqSelector(selector)).toEqual(true);
  });

  it("should not match when eq", () => {
    const selector = "#id:eq(0)";

    expect(isNotEqSelector(selector)).toEqual(false);
  });
});

describe("Personalization::DOM::helperForEq::splitWithEq", () => {
  it("should split when no eq", () => {
    const selector = "#id";

    expect(splitWithEq(selector)).toEqual(["#id"]);
  });

  it("should split when eq", () => {
    const selector = "#id:eq(0)";

    expect(splitWithEq(selector)).toEqual(["#id", "0"]);
  });
});
