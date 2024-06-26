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

import injectSendFetchRequest from "../../../../../../src/core/network/requestMethods/injectSendFetchRequest.js";

describe("injectSendFetchRequest", () => {
  it("resolves returned promise upon network success", () => {
    const fetchResult = {
      status: 999,
      headers: jasmine.createSpyObj("headers", {
        get: "headervalue",
      }),
      text() {
        return Promise.resolve("content");
      },
    };
    const fetch = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve(fetchResult));
    const sendFetchRequest = injectSendFetchRequest({ fetch });
    return sendFetchRequest("http://example.com/endpoint", { a: "b" }).then(
      (result) => {
        expect(result.statusCode).toBe(999);
        expect(result.getHeader("Content-Type")).toBe("headervalue");
        expect(result.body).toBe("content");
        expect(fetchResult.headers.get).toHaveBeenCalledWith("Content-Type");
      },
    );
  });

  it("rejects returned promise upon network failure", () => {
    const fetch = jasmine
      .createSpy()
      .and.returnValue(Promise.reject(new Error("No connection")));
    const sendFetchRequest = injectSendFetchRequest({ fetch });
    return sendFetchRequest("http://example.com/endpoint", { a: "b" })
      .then(fail)
      .catch((error) => {
        expect(error.message).toBe("No connection");
      });
  });
});
