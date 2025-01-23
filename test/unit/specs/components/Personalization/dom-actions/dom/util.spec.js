/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";
import { addPxIfMissing } from "../../../../../../../src/components/Personalization/dom-actions/dom/util.js";

describe("Personalization::DOM::util", () => {
  it("appends 'px' string if missing", () => {
    const value = "400";
    const result = addPxIfMissing(value);
    expect(result).toEqual("400px");
  });
  it("does not append 'px' string if already present", () => {
    const value = "400px";
    const result = addPxIfMissing(value);
    expect(result).toEqual("400px");
  });
});
