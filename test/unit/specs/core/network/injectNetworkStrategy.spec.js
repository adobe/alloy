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
  const url = "http://example.com";
  const body = "testbody";

  let sendFetchRequestPromise;
  let sendFetchRequest;
  let sendBeaconRequestPromise;
  let sendBeaconRequest;

  beforeEach(() => {
    sendFetchRequestPromise = Promise.resolve();
    sendFetchRequest = jasmine
      .createSpy()
      .and.returnValue(sendFetchRequestPromise);
    sendBeaconRequestPromise = Promise.resolve();
    sendBeaconRequest = jasmine
      .createSpy()
      .and.returnValue(sendBeaconRequestPromise);
  });

  it("uses sendBeacon if document may unload", () => {
    const networkStrategy = injectNetworkStrategy({
      sendFetchRequest,
      sendBeaconRequest
    });
    const result = networkStrategy({
      url,
      body,
      documentMayUnload: true
    });
    expect(sendBeaconRequest).toHaveBeenCalledWith(url, body);
    expect(result).toBe(sendBeaconRequestPromise);
  });

  it("uses fetch if document will not unload", () => {
    const networkStrategy = injectNetworkStrategy({
      sendFetchRequest,
      sendBeaconRequest
    });
    const result = networkStrategy({
      url,
      body,
      documentMayUnload: false
    });
    expect(sendFetchRequest).toHaveBeenCalledWith(url, body);
    expect(result).toBe(sendFetchRequestPromise);
  });
});
