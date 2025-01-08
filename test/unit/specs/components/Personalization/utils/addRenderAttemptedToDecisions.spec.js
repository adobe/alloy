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

import { describe, it, expect } from "vitest";
import addRenderAttemptedToDecisions from "../../../../../../src/components/Personalization/utils/addRenderAttemptedToDecisions.js";

describe("Personalization::addRenderAttemptedToDecisions", () => {
  it("adds a renderAttempted flag", () => {
    const decisions = [
      {
        blah: "123",
      },
      {
        blah: "345",
      },
    ];
    const result = addRenderAttemptedToDecisions({
      decisions,
      renderAttempted: true,
    });
    expect(result[0].renderAttempted).toEqual(true);
    expect(result[1].renderAttempted).toEqual(true);
    expect(decisions[0].renderAttempted).toBeUndefined();
    expect(decisions[1].renderAttempted).toBeUndefined();
  });
});
