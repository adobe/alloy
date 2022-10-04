/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import isPageWideScope from "../../../../../../src/components/Personalization/utils/isPageWideScope";

describe("Personalization::isPageWideScope", () => {
  it("checks for a page-wide scope", () => {
    expect(isPageWideScope("__view__")).toBeTrue();
    expect(isPageWideScope("name")).toBeFalse();
    expect(isPageWideScope("web://domain.com")).toBeTrue();
    expect(isPageWideScope("web://domain.com/path/page.html")).toBeTrue();
    expect(isPageWideScope("web://domain.com#fragment")).toBeFalse();
    expect(isPageWideScope("webapp://domain.com")).toBeFalse();
    expect(isPageWideScope("webapp://domain.com#view")).toBeFalse();
  });
});
