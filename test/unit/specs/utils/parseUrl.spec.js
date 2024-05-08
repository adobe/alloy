/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import parseUrl from ".../../../../src/utils/parseUrl.js";

describe("parseUrl", () => {
  it("should parse a valid URL with all components", () => {
    const url = "https://example.com/path/to/page?param=value#section";

    const result = parseUrl(url);
    expect(result.path).toBe("/path/to/page");
    expect(result.query).toBe("param=value");
    expect(result.fragment).toBe("section");
    expect(result.domain).toBe("example.com");
    expect(result.subdomain).toBe("");
    expect(result.topLevelDomain).toBe("com");
  });

  it("should handle URL without subdomain", () => {
    const url = "https://example.com";

    const result = parseUrl(url);

    expect(result.path).toBe("");
    expect(result.query).toBe("");
    expect(result.fragment).toBe("");
    expect(result.domain).toBe("example.com");
    expect(result.subdomain).toBe("");
    expect(result.topLevelDomain).toBe("com");
  });

  it("should handle empty URL and return default values", () => {
    const url = "";

    const result = parseUrl(url);
    expect(result.path).toBe("");
    expect(result.query).toBe("");
    expect(result.fragment).toBe("");
    expect(result.domain).toBe("");
    expect(result.subdomain).toBe("");
    expect(result.topLevelDomain).toBe("");
  });

  it("should handle URL with subdomain", () => {
    const url = "https://www.example.com";

    const result = parseUrl(url);
    expect(result.path).toBe("");
    expect(result.query).toBe("");
    expect(result.fragment).toBe("");
    expect(result.domain).toBe("www.example.com");
    expect(result.subdomain).toBe("");
    expect(result.topLevelDomain).toBe("com");
  });
});
