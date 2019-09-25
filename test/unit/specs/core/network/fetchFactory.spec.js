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

import fetchFactory from "../../../../../src/core/network/fetchFactory";

describe("fetchFactory", () => {
  it("handles a 200 response", () => {
    const nativeFetch = jasmine.createSpy().and.returnValue(
      Promise.resolve({
        ok: true,
        status: 200,
        text() {
          return Promise.resolve("content");
        }
      })
    );
    const fetch = fetchFactory(nativeFetch);
    return fetch("http://example.com/endpoint", { a: "b" }).then(result => {
      expect(result).toBe("content");
    });
  });

  it("handles a 204 response", () => {
    const nativeFetch = jasmine.createSpy().and.returnValue(
      Promise.resolve({
        ok: true,
        status: 204
      })
    );
    const fetch = fetchFactory(nativeFetch);
    return fetch("http://example.com/endpoint", { a: "b" }).then(result => {
      expect(result).toBeUndefined();
    });
  });

  it("handles a 500 response", () => {
    const nativeFetch = jasmine.createSpy().and.returnValue(
      Promise.resolve({
        ok: false,
        status: 500
      })
    );
    const fetch = fetchFactory(nativeFetch);
    return fetch("http://example.com/endpoint", { a: "b" })
      .then(fail)
      .catch(error => {
        expect(error.message).toBe("Bad response code: 500");
      });
  });
});
