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

import extractDomain from "../../../../../../../src/components/ActivityCollector/utils/dom/extractDomain.js";

describe("ActivityCollector::extractDomain", () => {
  it("should extract the domain from a URL", () => {
    expect(extractDomain("www.example.com")).toBe("www.example.com");
    expect(extractDomain("http://www.example.com")).toBe("www.example.com");
    expect(extractDomain("https://www.example.com")).toBe("www.example.com");
    expect(extractDomain("https://www.example.com/")).toBe("www.example.com");
    expect(extractDomain("https://www.example.com/cool/page")).toBe(
      "www.example.com",
    );
  });

  it("should handle URLs without a protocol", () => {
    expect(extractDomain("example.com")).toBe("example.com");
    expect(extractDomain("www.example.com")).toBe("www.example.com");
    expect(extractDomain("www.example.com/")).toBe("www.example.com");
    expect(extractDomain("www.example.com/cool/page")).toBe("www.example.com");
  });
});
