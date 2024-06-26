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

import trimQueryFromUrl from "../../../../../../src/components/ActivityCollector/utils/trimQueryFromUrl.js";

describe("ActivityCollector::trimQueryFromUrl", () => {
  it("Removes query portion from URL", () => {
    const urls = [
      ["http://example.com", "http://example.com"],
      [
        "https://example.com:123/example?example=123",
        "https://example.com:123/example",
      ],
      ["file://example.txt", "file://example.txt"],
      ["http://example.com/?example=123", "http://example.com/"],
      ["http://example.com/#example", "http://example.com/"],
    ];
    urls.forEach((url) => {
      expect(trimQueryFromUrl(url[0])).toBe(url[1]);
    });
  });
});
