/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";
import decodeUriComponentSafely from "../../../../src/utils/decodeUriComponentSafely.js";

describe("decodeUriComponentSafely", () => {
  it("decodes a uri encoded string", () => {
    expect(decodeUriComponentSafely("%3Fx%3Dtest")).toEqual("?x=test");
  });
  it("returns an empty string when an invalid encoded URI component is provided", () => {
    expect(
      decodeUriComponentSafely(
        "MCORGID%3D5BFE274A5F6980A50A495C08%2540AdobeOrg%ttt",
      ),
    ).toEqual("");
  });
});
