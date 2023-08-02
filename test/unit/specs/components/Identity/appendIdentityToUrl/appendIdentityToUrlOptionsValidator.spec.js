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
import appendIdentityToUrlOptionsValidator from "../../../../../../src/components/Identity/appendIdentityToUrl/appendIdentityToUrlOptionsValidator";

describe("Identity::appendIdentityToUrlOptionsValidator", () => {
  [
    undefined,
    "myurl",
    {},
    { url: "" },
    { url: "hello", other: "goodbye" }
  ].forEach(param => {
    it(`should throw an error when ${JSON.stringify(param)} is passed`, () => {
      expect(() => {
        appendIdentityToUrlOptionsValidator(param);
      }).toThrowError();
    });
  });

  it("should accept a url", () => {
    expect(
      appendIdentityToUrlOptionsValidator({ url: "http://google.com" })
    ).toEqual({ url: "http://google.com" });
  });

  it("should accept override configuration", () => {
    expect(() => {
      appendIdentityToUrlOptionsValidator({
        url: "http://google.com",
        edgeConfigOverrides: { identity: { idSyncContainerId: "123" } }
      });
    }).not.toThrowError();
    expect(() => {
      appendIdentityToUrlOptionsValidator({
        url: "http://google.com",
        edgeConfigOverrides: {}
      });
    }).not.toThrowError();
  });
});
