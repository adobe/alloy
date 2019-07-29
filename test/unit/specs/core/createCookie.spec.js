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

import createCookie, { clearProxies } from "../../../../src/core/createCookie";
import cookie from "../../../../src/utils/cookie";
import cookieDetails from "../../../../src/constants/cookieDetails";

const componentNamespace1 = "component1";
const componentNamespace2 = "component2";
const propertyId1 = "property1";
const propertyId2 = "property2";
const COOKIE_NAME = cookieDetails.ALLOY_COOKIE_NAME;
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
    clearProxies();
    removeAllCookies();
  });
  beforeEach(() => {
    clearProxies();
    removeAllCookies();
  });

  it("should return an undefined object when no cookie is found", () => {
    alloyCookie = createCookie(componentNamespace1);
    const test1 = alloyCookie.get();
    expect(test1).toEqual(undefined);
    alloyCookie = createCookie(componentNamespace1, propertyId1);
    const test2 = alloyCookie.get();
    expect(test2).toEqual(undefined);
  });

  it("Should throw an error when an invalid format is set in cookie", () => {
    alloyCookie = createCookie(componentNamespace1, propertyId1);
    document.cookie = `${COOKIE_NAME}_${propertyId1}=abbc|jhjkh`;
    expect(() => {
      alloyCookie.get();
    }).toThrow(
      new Error(`Invalid cookie format in ${COOKIE_NAME}_${propertyId1} cookie`)
    );
  });

  it("should create an object with component namespace for storing", () => {
    alloyCookie = createCookie(componentNamespace1, propertyId1);
    alloyCookie.set("key1", "val1");
    expect(cookie.get(`${COOKIE_NAME}_${propertyId1}`)).toBe(
      `{"${componentNamespace1}":{"key1":"val1"}}`
    );
  });

  it("should only read the cookie from storage once (for optimization)", () => {
    cookie.set(
      `${COOKIE_NAME}_${propertyId1}`,
      `{"${componentNamespace1}":{"key1":"val1"}}`
    );
    alloyCookie = createCookie(componentNamespace1, propertyId1);
    expect(alloyCookie.get("key1")).toBe("val1");
    removeAllCookies();
    expect(alloyCookie.get("key1")).toBe("val1");
    alloyCookie.set("key1", "val2");
    removeAllCookies();
    expect(alloyCookie.get("key1")).toBe("val2");
  });

  // CORE-32658
  it("should only create a single cookie cache per cookie", () => {
    cookie.set(
      `${COOKIE_NAME}_${propertyId1}`,
      `{"${componentNamespace1}":{"key1":"val1"}}`
    );
    const alloyCookie1 = createCookie(componentNamespace1, propertyId1);
    const alloyCookie2 = createCookie(componentNamespace1, propertyId1);
    const alloyCookie3 = createCookie(componentNamespace1, propertyId2);
    // Force alloyCookie1 to deserialize and cache the cookie
    alloyCookie1.get("key1");
    // Since alloyCookie1 and alloyCookie2 should be sharing the same cache,
    // this change should be reflected in both.
    alloyCookie2.set("key1", "val2");
    expect(alloyCookie1.get("key1")).toBe("val2");
    // alloyCookie3 should not share the same cache, since it's a
    // different cookie (because it's a different property ID).
    expect(alloyCookie3.get("key1")).toBeUndefined();
  });

  it("should update a stored value", () => {
    alloyCookie = createCookie(componentNamespace1, propertyId1);

    alloyCookie.set("key1", "val1");
    expect(cookie.get(`${COOKIE_NAME}_${propertyId1}`)).toBe(
      `{"${componentNamespace1}":{"key1":"val1"}}`
    );

    alloyCookie.set("key1", "valnew");
    alloyCookie.set("key2", "val2");
    expect(cookie.get(`${COOKIE_NAME}_${propertyId1}`)).toBe(
      `{"${componentNamespace1}":{"key1":"valnew","key2":"val2"}}`
    );
  });

  it("should remove a stored key value pair", () => {
    alloyCookie = createCookie(componentNamespace1, propertyId1);

    alloyCookie.set("key1", "val1");
    expect(cookie.get(`${COOKIE_NAME}_${propertyId1}`)).toBe(
      `{"${componentNamespace1}":{"key1":"val1"}}`
    );

    alloyCookie.set("key1", "valnew");
    alloyCookie.set("key2", "val2");
    expect(cookie.get(`${COOKIE_NAME}_${propertyId1}`)).toBe(
      `{"${componentNamespace1}":{"key1":"valnew","key2":"val2"}}`
    );

    alloyCookie.remove("key2");
    expect(cookie.get(`${COOKIE_NAME}_${propertyId1}`)).toBe(
      `{"${componentNamespace1}":{"key1":"valnew"}}`
    );
  });

  it("should remove a stored key value pair only when present", () => {
    alloyCookie = createCookie(componentNamespace1, propertyId1);

    alloyCookie.remove("key1");
    expect(cookie.get(`${COOKIE_NAME}_${propertyId1}`)).toEqual(undefined);

    alloyCookie.set("key1", "valnew");
    alloyCookie.remove("key2");
    expect(cookie.get(`${COOKIE_NAME}_${propertyId1}`)).toBe(
      `{"${componentNamespace1}":{"key1":"valnew"}}`
    );
  });

  it("should create new namespace for each component namespace", () => {
    const alloyCookie1 = createCookie(componentNamespace1, propertyId1);
    const alloyCookie2 = createCookie(componentNamespace2, propertyId1);
    alloyCookie1.set("key1", "val1");
    expect(cookie.get(`${COOKIE_NAME}_${propertyId1}`)).toBe(
      `{"${componentNamespace1}":{"key1":"val1"}}`
    );

    alloyCookie2.set("key1", "val1");
    expect(cookie.get(`${COOKIE_NAME}_${propertyId1}`)).toBe(
      `{"${componentNamespace1}":{"key1":"val1"},"${componentNamespace2}":{"key1":"val1"}}`
    );
  });
});
