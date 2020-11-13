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

import injectSendFetchRequest from "../../../../../src/core/network/injectSendFetchRequest";

describe("injectSendFetchRequest", () => {
  it("resolves returned promise upon network success", () => {
    const fetch = jasmine.createSpy().and.returnValue(
      Promise.resolve({
        status: 999,
        text() {
          return Promise.resolve("content");
        }
      })
    );
    const sendFetchRequest = injectSendFetchRequest({ fetch });
    return sendFetchRequest("http://example.com/endpoint", { a: "b" }).then(
      result => {
        expect(result).toEqual({
          status: 999,
          body: "content"
        });
      }
    );
  });

  it("rejects returned promise upon network failure", () => {
    const fetch = jasmine
      .createSpy()
      .and.returnValue(Promise.reject(new Error("No connection")));
    const sendFetchRequest = injectSendFetchRequest({ fetch });
    return sendFetchRequest("http://example.com/endpoint", { a: "b" })
      .then(fail)
      .catch(error => {
        expect(error.message).toBe("No connection");
      });
  });
});
