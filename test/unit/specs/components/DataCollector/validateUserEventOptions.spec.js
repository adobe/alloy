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
  it("returns array of errors if the event options are invalid", () => {
    [
      undefined,
      {},
      { xdm: [] },
      { xdm: {} },
      { xdm: { test: "" } },
      { xdm: { eventType: "" } },
      { type: "", xdm: { test: "" } },
      { data: [] },
      { data: {} },
      { viewStart: "" },
      { viewStart: true },
      { scopes: {} },
      { scopes: [] },
      { scopes: [""] }
    ].forEach(options => {
      const errors = validateUserEventOptions(options);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
  it("returns empty array if the event options valid", () => {
    [
      { xdm: { eventType: "test" } },
      { type: "test", xdm: { test: "" } },
      { data: { test: "" } },
      { viewStart: true, data: { test: "" } },
      { scopes: ["test"] }
    ].forEach(options => {
      const errors = validateUserEventOptions(options);
      expect(errors.length).toBe(0);
    });
  });
});
