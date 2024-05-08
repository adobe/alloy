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

import injectAppendIdentityToUrl from "../../../../../../src/components/Identity/appendIdentityToUrl/injectAppendIdentityToUrl.js";

describe("appendIdentityToUrl", () => {
  const date = new Date(1234);
  const orgId = "myorg@adobe";
  const appendIdentityToUrl = injectAppendIdentityToUrl({
    dateProvider: () => date,
    orgId
  });
  const ecid = "1234";
  const qsp = "adobe_mc=TS%3D1%7CMCMID%3D1234%7CMCORGID%3Dmyorg%2540adobe";

  const test = (original, expected) => {
    it(`appends to "${original}"`, () => {
      expect(appendIdentityToUrl(ecid, original)).toBe(expected);
    });
  };

  test("", `?${qsp}`);
  test("/", `/?${qsp}`);
  test("?", `?${qsp}`);
  test("?a=b", `?a=b&${qsp}`);
  test("#test", `?${qsp}#test`);
  test("/example.html", `/example.html?${qsp}`);
  test("https://adobe.com", `https://adobe.com?${qsp}`);
  test("https://adobe.com?", `https://adobe.com?${qsp}`);
  test("https://adobe.com?a=1", `https://adobe.com?a=1&${qsp}`);
  test("https://adobe.com#myhash", `https://adobe.com?${qsp}#myhash`);
  test("https://adobe.com?#myhash", `https://adobe.com?${qsp}#myhash`);
  test("https://adobe.com?a=1#myhash", `https://adobe.com?a=1&${qsp}#myhash`);
  test(
    "https://adobe.com#myweird?hash",
    `https://adobe.com?${qsp}#myweird?hash`
  );
});
