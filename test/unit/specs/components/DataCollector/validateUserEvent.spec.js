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

import validateUserEvent from "../../../../../src/components/DataCollector/validateUserEvent";
import createEvent from "../../../../../src/core/createEvent";

describe("DataCollector::validateUserEvent", () => {
  let event;
  beforeEach(() => {
    event = createEvent();
  });

  it("reports the event as invalid if empty", () => {
    const warnings = validateUserEvent(event);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("reports the event as invalid if event type is missing", () => {
    event.setUserXdm({ a: "1" });
    const warnings = validateUserEvent(event);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("reports the event as valid if xdm event type is included", () => {
    event.setUserXdm({ a: "1", eventType: "test" });
    const warnings = validateUserEvent(event);
    expect(warnings.length).toBe(0);
  });
});
