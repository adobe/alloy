/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createCookie from "../../../src/core/createCookie";
import cookie from "../../../src/utils/cookie";

const prefix = "testprefix";

const removeCookie = name => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

const removeAllCookies = () => {
  const cookies = document.cookie.split(";");
  cookies.forEach(cookieName => {
    removeCookie(cookieName.split("=")[0]);
  });
};

describe("createCookie", () => {
  let alloyCookie;

  afterEach(() => {
    removeAllCookies();
  });
  beforeEach(() => {
    removeAllCookies();
  });

  it("should return an empty object when no cookie is found", () => {
    alloyCookie = createCookie(prefix);
    const test = alloyCookie.get();
    expect(test).toEqual({});
  });

  it("should create an object with prefixed namespace for storing", () => {
    alloyCookie = createCookie(prefix);
    const test = alloyCookie.set({ key1: "val1" });
    expect(test).toEqual({ key1: "val1" });
    expect(cookie.get("TEMP_ALLOY_COOKIE")).toBe(
      `{"${prefix}":{"key1":"val1"}}`
    );
  });

  it("should update an stored value", () => {
    alloyCookie = createCookie(prefix);

    let test = alloyCookie.set({ key1: "val1" });
    expect(test).toEqual({ key1: "val1" });
    expect(cookie.get("TEMP_ALLOY_COOKIE")).toBe(
      `{"${prefix}":{"key1":"val1"}}`
    );

    test = alloyCookie.set({ key1: "valnew", key2: "val2" });
    expect(test).toEqual({ key1: "valnew", key2: "val2" });
    expect(cookie.get("TEMP_ALLOY_COOKIE")).toBe(
      `{"${prefix}":{"key1":"valnew","key2":"val2"}}`
    );
  });

  it("should create new namespace for each prefix", () => {
    const alloyCookie1 = createCookie(`${prefix}1`);
    const alloyCookie2 = createCookie(`${prefix}2`);
    let test = alloyCookie1.set({ key1: "val1" });
    expect(test).toEqual({ key1: "val1" });
    expect(cookie.get("TEMP_ALLOY_COOKIE")).toBe(
      `{"${prefix}1":{"key1":"val1"}}`
    );

    test = alloyCookie2.set({ key1: "val1", key2: "val2" });
    expect(test).toEqual({ key1: "val1", key2: "val2" });
    expect(cookie.get("TEMP_ALLOY_COOKIE")).toBe(
      `{"${prefix}1":{"key1":"val1"},"${prefix}2":{"key1":"val1","key2":"val2"}}`
    );
  });
});
