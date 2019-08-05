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

import createCookie from "../../../../src/core/createCookie";
import { clone } from "../../../../src/utils";

const componentNamespace1 = "component1";
const componentNamespace2 = "component2";

describe("createCookie", () => {
  let cookieProxy;
  let alloyCookie;

  beforeEach(() => {
    cookieProxy = jasmine.createSpyObj("cookieProxy", ["get", "set"]);
  });

  describe("get", () => {
    it("should return undefined when no cookie is found", () => {
      cookieProxy.get.and.returnValue(undefined);
      alloyCookie = createCookie(cookieProxy, componentNamespace1);
      const value = alloyCookie.get("foo");
      expect(value).toEqual(undefined);
    });

    it("should return undefined if component namespace not found on cookie", () => {
      cookieProxy.get.and.returnValue({});
      alloyCookie = createCookie(cookieProxy, componentNamespace1);
      const value = alloyCookie.get("foo");
      expect(value).toEqual(undefined);
    });

    it("should return undefined if key not found on cookie within component namespace", () => {
      cookieProxy.get.and.returnValue({
        [componentNamespace1]: {}
      });
      alloyCookie = createCookie(cookieProxy, componentNamespace1);
      const value = alloyCookie.get("foo");
      expect(value).toEqual(undefined);
    });

    it("should return value if found on cookie", () => {
      cookieProxy.get.and.returnValue({
        [componentNamespace1]: {
          foo: "bar"
        }
      });
      alloyCookie = createCookie(cookieProxy, componentNamespace1);
      const value = alloyCookie.get("foo");
      expect(value).toEqual("bar");
    });

    it("should throw an error if namespace is undefined", () => {
      alloyCookie = createCookie(cookieProxy, undefined);
      expect(() => alloyCookie.get("foo")).toThrowError();
    });
  });

  describe("set", () => {
    it("should set value when cookie doesn't exist", () => {
      cookieProxy.get.and.returnValue(undefined);
      alloyCookie = createCookie(cookieProxy, componentNamespace1);
      alloyCookie.set("foo", "bar");
      expect(cookieProxy.set).toHaveBeenCalledWith({
        [componentNamespace1]: {
          foo: "bar"
        }
      });
    });

    it("should set value when namespace doesn't exist on cookie", () => {
      cookieProxy.get.and.returnValue({});
      alloyCookie = createCookie(cookieProxy, componentNamespace1);
      alloyCookie.set("foo", "bar");
      expect(cookieProxy.set).toHaveBeenCalledWith({
        [componentNamespace1]: {
          foo: "bar"
        }
      });
    });

    it("should set value when cookie already has a bunch of data", () => {
      const originalCookieObject = {
        [componentNamespace1]: {
          foo: "bar",
          tool: "sickle"
        },
        [componentNamespace2]: {
          documentary: "First Face in America"
        }
      };
      const clonedOriginalCookieObject = clone(originalCookieObject);
      cookieProxy.get.and.returnValue(originalCookieObject);
      alloyCookie = createCookie(cookieProxy, componentNamespace1);
      alloyCookie.set("foo", "baz");
      expect(cookieProxy.set).toHaveBeenCalledWith({
        [componentNamespace1]: {
          foo: "baz",
          tool: "sickle"
        },
        [componentNamespace2]: {
          documentary: "First Face in America"
        }
      });
      // The original cookie object returned from the cookie proxy shouldn't
      // have been modified.
      expect(originalCookieObject).toEqual(clonedOriginalCookieObject);
    });

    it("should throw an error if namespace is empty String", () => {
      alloyCookie = createCookie(cookieProxy, "");
      expect(() => alloyCookie.set("foo", "baz")).toThrowError();
    });
  });

  describe("remove", () => {
    it("doesn't attempt to set cookie when cookie doesn't exist", () => {
      cookieProxy.get.and.returnValue(undefined);
      alloyCookie = createCookie(cookieProxy, componentNamespace1);
      alloyCookie.remove("foo");
      expect(cookieProxy.set).not.toHaveBeenCalled();
    });

    it("doesn't attempt to set cookie when namespace doesn't exist in cookie", () => {
      cookieProxy.get.and.returnValue({});
      alloyCookie = createCookie(cookieProxy, componentNamespace1);
      alloyCookie.remove("foo");
      expect(cookieProxy.set).not.toHaveBeenCalled();
    });

    it("should remove value when cookie already has a bunch of data", () => {
      const originalCookieObject = {
        [componentNamespace1]: {
          foo: "bar",
          tool: "sickle"
        },
        [componentNamespace2]: {
          documentary: "First Face in America"
        }
      };
      const clonedOriginalCookieObject = clone(originalCookieObject);
      cookieProxy.get.and.returnValue(originalCookieObject);
      alloyCookie = createCookie(cookieProxy, componentNamespace1);
      alloyCookie.remove("foo");
      expect(cookieProxy.set).toHaveBeenCalledWith({
        [componentNamespace1]: {
          tool: "sickle"
        },
        [componentNamespace2]: {
          documentary: "First Face in America"
        }
      });
      // The original cookie object returned from the cookie proxy shouldn't
      // have been modified.
      expect(originalCookieObject).toEqual(clonedOriginalCookieObject);
    });

    it("should throw an error if namespace is undefined", () => {
      alloyCookie = createCookie(cookieProxy, undefined);
      expect(() => alloyCookie.remove("foo")).toThrowError();
    });
  });
});
