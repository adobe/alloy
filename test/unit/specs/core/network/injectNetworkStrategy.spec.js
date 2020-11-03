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

import injectNetworkStrategy from "../../../../../src/core/network/injectNetworkStrategy";

describe("injectNetworkStrategy", () => {
  const logger = { log() {} };
  const url = "http://example.com";
  const body = "testbody";

  let sendFetchRequestPromise;
  let sendFetchRequest;
  let injectSendFetchRequest;
  let sendXhrRequestPromise;
  let sendXhrRequest;
  let injectSendXhrRequest;
  let sendBeaconRequestPromise;
  let sendBeaconRequest;
  let injectSendBeaconRequest;

  beforeEach(() => {
    sendFetchRequestPromise = Promise.resolve();
    sendFetchRequest = jasmine
      .createSpy()
      .and.returnValue(sendFetchRequestPromise);
    injectSendFetchRequest = jasmine
      .createSpy()
      .and.returnValue(sendFetchRequest);
    sendXhrRequestPromise = Promise.resolve();
    sendXhrRequest = jasmine.createSpy().and.returnValue(sendXhrRequestPromise);
    injectSendXhrRequest = jasmine.createSpy().and.returnValue(sendXhrRequest);
    sendBeaconRequestPromise = Promise.resolve();
    sendBeaconRequest = jasmine
      .createSpy()
      .and.returnValue(sendBeaconRequestPromise);
    injectSendBeaconRequest = jasmine
      .createSpy()
      .and.returnValue(sendBeaconRequest);
  });

  it("uses fetch if available and document won't unload", () => {
    const window = {
      fetch() {},
      navigator: {}
    };
    const networkStrategy = injectNetworkStrategy({
      window,
      logger,
      injectSendFetchRequest,
      injectSendXhrRequest,
      injectSendBeaconRequest
    });
    const result = networkStrategy({
      url,
      body,
      documentMayUnload: false
    });
    expect(injectSendFetchRequest).toHaveBeenCalledWith({
      fetch: window.fetch
    });
    expect(sendFetchRequest).toHaveBeenCalledWith(url, body);
    expect(result).toBe(sendFetchRequestPromise);
  });

  it("uses XHR if fetch is unavailable and document won't unload", () => {
    const window = {
      XMLHttpRequest() {},
      navigator: {}
    };
    const networkStrategy = injectNetworkStrategy({
      window,
      logger,
      injectSendFetchRequest,
      injectSendXhrRequest,
      injectSendBeaconRequest
    });
    const result = networkStrategy({
      url,
      body,
      documentMayUnload: false
    });
    expect(injectSendXhrRequest).toHaveBeenCalledWith({
      XMLHttpRequest: window.XMLHttpRequest
    });
    expect(sendXhrRequest).toHaveBeenCalledWith(url, body);
    expect(result).toBe(sendXhrRequestPromise);
  });

  it("uses sendBeacon if available and document may unload", () => {
    const window = {
      fetch() {},
      navigator: {
        sendBeacon() {}
      }
    };
    const networkStrategy = injectNetworkStrategy({
      window,
      logger,
      injectSendFetchRequest,
      injectSendXhrRequest,
      injectSendBeaconRequest
    });
    const result = networkStrategy({
      url,
      body,
      documentMayUnload: true
    });
    expect(injectSendBeaconRequest).toHaveBeenCalledWith({
      navigator: window.navigator,
      sendFetchRequest,
      logger
    });
    expect(sendBeaconRequest).toHaveBeenCalledWith(url, body);
    expect(result).toBe(sendBeaconRequestPromise);
  });

  it("uses fetch if sendBeacon is unavailable, fetch is available, and document may unload", () => {
    const window = {
      fetch() {},
      navigator: {}
    };
    const networkStrategy = injectNetworkStrategy({
      window,
      logger,
      injectSendFetchRequest,
      injectSendXhrRequest,
      injectSendBeaconRequest
    });
    const result = networkStrategy({
      url,
      body,
      documentMayUnload: true
    });
    expect(injectSendFetchRequest).toHaveBeenCalledWith({
      fetch: window.fetch
    });
    expect(sendFetchRequest).toHaveBeenCalledWith(url, body);
    expect(result).toBe(sendFetchRequestPromise);
  });

  it("uses XHR if sendBeacon is unavailable, fetch is unavailable, and document may unload", () => {
    const window = {
      XMLHttpRequest() {},
      navigator: {}
    };
    const networkStrategy = injectNetworkStrategy({
      window,
      logger,
      injectSendFetchRequest,
      injectSendXhrRequest,
      injectSendBeaconRequest
    });
    const result = networkStrategy({
      url,
      body,
      documentMayUnload: true
    });
    expect(injectSendXhrRequest).toHaveBeenCalledWith({
      XMLHttpRequest: window.XMLHttpRequest
    });
    expect(sendXhrRequest).toHaveBeenCalledWith(url, body);
    expect(result).toBe(sendXhrRequestPromise);
  });
});
