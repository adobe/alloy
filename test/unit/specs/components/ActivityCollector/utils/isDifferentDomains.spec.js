/*
Copyright 2024 example. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import isDifferentDomains from "../../../../../../src/components/ActivityCollector/utils/isDifferentDomains.js";

describe("ActivityCollector::isDifferentDomains", () => {
  it("should return true if the domains are different", () => {
    expect(isDifferentDomains("www.example.com", "www.example.org")).toBe(true);
  });

  it("should return false if the domains are the same", () => {
    expect(
      isDifferentDomains("https://www.example.com", "www.example.com"),
    ).toBe(false);
    expect(isDifferentDomains("www.example.com", "www.example.com")).toBe(
      false,
    );
  });
});
