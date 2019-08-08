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

import createCookieProxy from "../../../../src/core/createCookieProxy";
import cookieJar from "../../../../src/utils/cookieJar";

const COOKIE_NAME = "testcookie";
const COOKIE_EXPIRES = 180;
const removeCookie = name => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

const removeAllCookies = () => {
  const cookies = document.cookie.split(";");
  cookies.forEach(cookieName => {
    removeCookie(cookieName.split("=")[0]);
  });
};

describe("createCookieProxy", () => {
  let cookieProxy;

  afterEach(() => {
    removeAllCookies();
  });
  beforeEach(() => {
    removeAllCookies();
    cookieProxy = createCookieProxy(COOKIE_NAME, COOKIE_EXPIRES);
  });

  describe("get", () => {
    it("should return an undefined object when no cookie is found", () => {
      expect(cookieProxy.get()).toEqual(undefined);
    });

    it("should throw an error when an invalid format is set in cookie", () => {
      document.cookie = `${COOKIE_NAME}=abbc|jhjkh`;
      expect(() => {
        cookieProxy.get();
      }).toThrow(new Error(`Invalid cookie format in ${COOKIE_NAME} cookie`));
    });

    it("should only read the cookie from storage once (for optimization)", () => {
      cookieJar.set(`${COOKIE_NAME}`, '{"foo":"bar"}');
      expect(cookieProxy.get()).toEqual({ foo: "bar" });
      removeAllCookies();
      expect(cookieProxy.get()).toEqual({ foo: "bar" });
      cookieProxy.set({
        foo: "baz"
      });
      removeAllCookies();
      expect(cookieProxy.get()).toEqual({ foo: "baz" });
    });
  });

  describe("set", () => {
    it("should create a cookie if one doesn't exist", () => {
      cookieProxy.set({ foo: "bar" });
      expect(cookieJar.get(COOKIE_NAME)).toBe('{"foo":"bar"}');
    });

    it("should update a cookie if one does exist", () => {
      document.cookie = `${COOKIE_NAME}={"foo":"bar"}`;
      cookieProxy.set({ foo: "baz" });
      expect(cookieJar.get(COOKIE_NAME)).toBe('{"foo":"baz"}');
    });
  });
});
