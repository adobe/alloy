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

import urlStartsWithScheme from "../../../../../../src/components/ActivityCollector/utils/urlStartsWithScheme";

describe("ActivityCollector::urlStartsWithScheme", () => {
  it("Returns true for URLs that starts with a scheme", () => {
    const urlsThatStartsWithScheme = [
      "http://example.com",
      "https://example.com",
      "https://example.com:123/example?example=123",
      "file://example.txt"
    ];
    urlsThatStartsWithScheme.forEach(url => {
      expect(urlStartsWithScheme(url)).toBe(true);
    });
  });
  it("Returns false for URLs that does not start with a scheme", () => {
    const urlsThatDoesNotStartWithScheme = [
      "example.com",
      "example.txt/http://example",
      "https:",
      "//example.html",
      "",
      null,
      undefined
    ];
    urlsThatDoesNotStartWithScheme.forEach(url => {
      expect(urlStartsWithScheme(url)).toBe(false);
    });
  });
});
