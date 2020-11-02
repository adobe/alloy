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

import stackError from "../../../../src/utils/stackError";

describe("stackError", () => {
  it("stacks message onto error instance", () => {
    const error = new Error("Conundrum encountered.");
    const result = stackError({ error, message: "Predicament discovered." });
    expect(result).toEqual(jasmine.any(Error));
    expect(result.message).toBe(
      "Predicament discovered.\nCaused by: Conundrum encountered."
    );
  });

  it("stacks message onto non-error instance", () => {
    const error = "Conundrum encountered.";
    const result = stackError({ error, message: "Predicament discovered." });
    expect(result).toEqual(jasmine.any(Error));
    expect(result.message).toBe(
      "Predicament discovered.\nCaused by: Conundrum encountered."
    );
  });
});
