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

import sendBeaconFactory from "../../../../../src/core/network/sendBeaconFactory";

// When running these tests in IE 11, they fail because IE doesn't like the
// way the blob is constructed (see
// https://github.com/bpampuch/pdfmake/pull/297/files for a workaround).
// Fortunately, if navigator.sendBeacon doesn't exist (IE 11), sendBeaconFactory
// should never be used (see createNetworkStrategy.js), so we can skip
// these tests altogether.
if (window.navigator.sendBeacon) {
  describe("sendBeaconFactory", () => {
    it("falls back to fetch if sendBeacon fails", () => {
      const navigator = {
        sendBeacon: jasmine.createSpy().and.returnValue(false)
      };
      const fetchPromise = Promise.resolve();
      const fetch = jasmine.createSpy().and.returnValue(fetchPromise);
      const logger = {
        log: jasmine.createSpy()
      };
      const sendBeacon = sendBeaconFactory(navigator, fetch, logger);
      const body = { a: "b" };
      const result = sendBeacon("https://example.com/endpoint", body);
      expect(navigator.sendBeacon).toHaveBeenCalledWith(
        "https://example.com/endpoint",
        jasmine.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith("https://example.com/endpoint", body);
      expect(logger.log).toHaveBeenCalledWith(
        jasmine.stringMatching("call has failed")
      );
      expect(result).toBe(fetchPromise);
    });

    it("does not fall back to fetch if sendBeacon succeeds", () => {
      const navigator = {
        sendBeacon: jasmine.createSpy().and.returnValue(true)
      };
      const body = { a: "b" };
      const fetch = jasmine.createSpy();
      const sendBeacon = sendBeaconFactory(navigator, fetch);
      return sendBeacon("https://example.com/endpoint", body).then(() => {
        expect(fetch).not.toHaveBeenCalled();
      });
    });
  });
}
