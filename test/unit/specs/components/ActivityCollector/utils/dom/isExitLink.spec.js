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

import isExitLink from "../../../../../../../src/components/ActivityCollector/utils/dom/isExitLink";

describe("ActivityCollector::isExitLink", () => {
  it("Returns true if the link leads away from the current hostname", () => {
    const mockWindow = {
      location: {
        hostname: "adobe.com"
      }
    };
    const clickedLinks = [
      "https://example.com",
      "http://example.com/index.html"
    ];
    clickedLinks.forEach(clickedLink => {
      expect(isExitLink(mockWindow, clickedLink)).toBe(true);
    });
  });
  it("Returns false if the link leads to the current hostname", () => {
    const mockWindow = {
      location: {
        hostname: "adobe.com"
      }
    };
    const clickedLinks = ["https://adobe.com", "http://adobe.com/index.html"];
    clickedLinks.forEach(clickedLink => {
      expect(isExitLink(mockWindow, clickedLink)).toBe(false);
    });
  });
});
