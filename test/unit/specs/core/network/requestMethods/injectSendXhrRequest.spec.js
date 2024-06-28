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

import injectSendXhrRequest from "../../../../../../src/core/network/requestMethods/injectSendXhrRequest.js";

describe("sendXhrRequest", () => {
  const url = "https://example.com/endpoint";
  let request;
  let XMLHttpRequest;
  let sendXhrRequest;
  let body;

  beforeEach(() => {
    request = jasmine.createSpyObj("xhrInstance", [
      "open",
      "setRequestHeader",
      "send",
      "onloadstart",
      "getResponseHeader",
    ]);
    // use non-arrow function because we need to use `this`
    XMLHttpRequest = function constructXMLHttpRequest() {
      return request;
    };

    sendXhrRequest = injectSendXhrRequest({ XMLHttpRequest });
    body = { a: "b" };
  });

  it("sets the response type during onloadstart", () => {
    sendXhrRequest(url, body);
    expect(request.responseType).toBeUndefined();
    request.onloadstart();
    expect(request.responseType).toBe("text");
  });

  it("opens a POST", () => {
    sendXhrRequest(url, body);
    expect(request.open).toHaveBeenCalledWith("POST", url, true);
  });

  it("sets content type", () => {
    sendXhrRequest(url, body);
    expect(request.setRequestHeader).toHaveBeenCalledWith(
      "Content-Type",
      "text/plain; charset=UTF-8",
    );
  });

  it("disables credentials", () => {
    sendXhrRequest(url, body);
    expect(request.withCredentials).toBe(true);
  });

  it("rejects promise upon error", () => {
    const xhrPromise = sendXhrRequest(url, body);
    request.onerror(new Error("bad thing happened"));
    return xhrPromise.then(fail).catch((error) => {
      expect(error.message).toBe("bad thing happened");
    });
  });

  it("rejects promise upon abort", () => {
    const xhrPromise = sendXhrRequest(url, body);
    request.onabort(new Error("bad thing happened"));
    return xhrPromise.then(fail).catch((error) => {
      expect(error.message).toBe("bad thing happened");
    });
  });

  it("sends body", () => {
    sendXhrRequest(url, body);
    expect(request.send).toHaveBeenCalledWith(body);
  });

  it("resolves returned promise upon network success", () => {
    const xhrPromise = sendXhrRequest("https://example.com/endpoint", body);
    request.readyState = 4;
    request.getResponseHeader.and.returnValue("headervalue");
    request.responseText = "response text";
    request.status = 999;
    request.onreadystatechange();
    return xhrPromise.then((result) => {
      expect(result.statusCode).toBe(999);
      expect(result.getHeader("Content-Type")).toBe("headervalue");
      expect(result.body).toBe("response text");
      expect(request.getResponseHeader).toHaveBeenCalledWith("Content-Type");
    });
  });
});
