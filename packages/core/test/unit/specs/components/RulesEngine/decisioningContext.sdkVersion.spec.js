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
import { vi, beforeEach, describe, it, expect } from "vitest";
import libraryVersion from "../../../../../src/constants/libraryVersion.js";
import {
  mockWindow,
  setupResponseHandler,
  proposition,
} from "./contextTestUtils.js";

describe("RulesEngine:globalContext:sdkVersion", () => {
  let applyResponse;
  const currentVersion = libraryVersion;
  beforeEach(() => {
    applyResponse = vi.fn();
  });
  it("satisfies rule based on matched alloy sdk version", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "~sdkver",
        matcher: "eq",
        values: [currentVersion],
      },
      type: "matcher",
    });
    expect(applyResponse).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        propositions: [proposition],
      }),
    );
  });
  it("does not satisfy rule due to unmatched dk version", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "~sdkver",
        matcher: "eq",
        values: ["2.18.0-beta.0"],
      },
      type: "matcher",
    });
    expect(applyResponse).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        propositions: [],
      }),
    );
  });
});
