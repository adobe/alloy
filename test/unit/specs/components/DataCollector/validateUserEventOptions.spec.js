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

import validateUserEventOptions from "../../../../../src/components/DataCollector/validateUserEventOptions";

describe("DataCollector::validateUserEventOptions", () => {
  it("returns array of errors for invalid options", () => {
    [
      undefined,
      { xdm: [] },
      { viewStart: "" },
      { data: [] },
      { scopes: {} }
    ].forEach(options => {
      const { errors } = validateUserEventOptions(options);
      expect(errors.length).toBeGreaterThan(
        0,
        `options: ${JSON.stringify(options)} should cause error`
      );
    });
  });
  it("returns array of warnings for invalid options", () => {
    [
      { data: {} },
      { xdm: {} },
      { xdm: { test: "" } },
      { xdm: { eventType: "" } },
      { type: "", xdm: { test: "" } },
      { scopes: [] },
      { scopes: [""] }
    ].forEach(options => {
      const { warnings } = validateUserEventOptions(options);
      expect(warnings.length).toBeGreaterThan(
        0,
        `options: ${JSON.stringify(options)} should cause warning`
      );
    });
  });
  it("returns no errors or warnings if the event options are valid", () => {
    [
      {},
      { xdm: { eventType: "test" } },
      { type: "test", xdm: { test: "" } },
      { viewStart: true },
      { data: { test: "" } },
      { viewStart: true, data: { test: "" } },
      { scopes: ["test"] }
    ].forEach(options => {
      const { errors, warnings } = validateUserEventOptions(options);
      expect(errors.length).toBe(
        0,
        `options: ${JSON.stringify(options)} should not cause error`
      );
      expect(warnings.length).toBe(
        0,
        `options: ${JSON.stringify(options)} should not cause warning`
      );
    });
  });
});
