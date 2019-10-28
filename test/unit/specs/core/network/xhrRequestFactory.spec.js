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

import xhrRequestFactory from "../../../../../src/core/network/xhrRequestFactory";

describe("xhrRequest", () => {
  const url = "https://example.com/endpoint";
  let request;
  let XMLHttpRequest;
  let xhrRequest;
  let body;

  beforeEach(() => {
    request = jasmine.createSpyObj("xhrInstance", [
      "open",
      "setRequestHeader",
      "send",
      "onloadstart"
    ]);
    XMLHttpRequest = () => {
      return request;
    };
    xhrRequest = xhrRequestFactory(XMLHttpRequest);
    body = { a: "b" };
  });

  it("sets the response type during onloadstart", () => {
    xhrRequest(url, body);
    expect(request.responseType).toBeUndefined();
    request.onloadstart();
    expect(request.responseType).toBe("text");
  });

  it("opens a POST", () => {
    xhrRequest(url, body);
    expect(request.open).toHaveBeenCalledWith("POST", url, true);
  });

  it("sets content type", () => {
    xhrRequest(url, body);
    expect(request.setRequestHeader).toHaveBeenCalledWith(
      "Content-Type",
      "text/plain; charset=UTF-8"
    );
  });

  it("disables credentials", () => {
    xhrRequest(url, body);
    expect(request.withCredentials).toBe(false);
  });

  it("rejects promise on error", () => {
    const xhrPromise = xhrRequest(url, body);
    request.onerror(new Error("bad thing happened"));
    return xhrPromise.then(fail).catch(error => {
      expect(error.message).toBe("bad thing happened");
    });
  });

  it("rejects promise on abort", () => {
    const xhrPromise = xhrRequest(url, body);
    request.onabort(new Error("bad thing happened"));
    return xhrPromise.then(fail).catch(error => {
      expect(error.message).toBe("bad thing happened");
    });
  });

  it("sends body", () => {
    xhrRequest(url, body);
    expect(request.send).toHaveBeenCalledWith(body);
  });

  it("handles a 204 response", () => {
    const xhrPromise = xhrRequest("https://example.com/endpoint", body);
    request.readyState = 4;
    request.status = 204;
    request.onreadystatechange();
    return xhrPromise.then(result => {
      expect(result).toBeUndefined();
    });
  });

  it("handles a 200 response", () => {
    const xhrPromise = xhrRequest("https://example.com/endpoint", body);
    request.readyState = 4;
    request.responseText = "response text";
    request.status = 200;
    request.onreadystatechange();
    return xhrPromise.then(result => {
      expect(result).toBe("response text");
    });
  });

  it("handles a 500 response", () => {
    const xhrPromise = xhrRequest("https://example.com/endpoint", body);
    request.readyState = 4;
    request.responseText = "response text";
    request.status = 500;
    request.onreadystatechange();
    return xhrPromise.then(fail).catch(error => {
      expect(error.message).toBe(
        'Invalid response code 500. Response was "response text".'
      );
    });
  });
});
