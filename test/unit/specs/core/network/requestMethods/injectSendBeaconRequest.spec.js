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

import { vi, describe, it, expect } from "vitest";
import injectSendBeaconRequest from "../../../../../../src/core/network/requestMethods/injectSendBeaconRequest.js";

// When running these tests in IE 11, they fail because IE doesn't like the
// way the blob is constructed (see
// https://github.com/bpampuch/pdfmake/pull/297/files for a workaround).
// Fortunately, if navigator.sendBeacon doesn't exist (IE 11), injectSendBeaconRequest
// should never be used (see injectNetworkStrategy.js), so we can skip
// these tests altogether.
const guardForSendBeaconAvailability = (spec) => {
  return window.navigator.sendBeacon
    ? spec
    : () => pending("No sendBeacon API available.");
};
describe("injectSendBeaconRequest", () => {
  it(
    "falls back to sendFetchRequest if sendBeacon fails",
    guardForSendBeaconAvailability(() => {
      const sendBeacon = vi.fn().mockReturnValue(false);
      const sendFetchRequestPromise = Promise.resolve();
      const sendFetchRequest = vi.fn().mockReturnValue(sendFetchRequestPromise);
      const logger = {
        info: vi.fn(),
      };
      const sendBeaconRequest = injectSendBeaconRequest({
        sendBeacon,
        sendFetchRequest,
        logger,
      });
      const body = {
        a: "b",
      };
      const result = sendBeaconRequest("https://example.com/endpoint", body);
      expect(sendBeacon).toHaveBeenCalledWith(
        "https://example.com/endpoint",
        expect.any(Object),
      );
      expect(sendFetchRequest).toHaveBeenCalledWith(
        "https://example.com/endpoint",
        body,
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringMatching("falling back to"),
      );
      expect(result).toBe(sendFetchRequestPromise);
    }),
  );
  it(
    "does not fall back to sendFetchRequest if sendBeacon succeeds",
    guardForSendBeaconAvailability(() => {
      const sendBeacon = vi.fn().mockReturnValue(true);
      const body = {
        a: "b",
      };
      const sendFetchRequest = vi.fn();
      const sendBeaconRequest = injectSendBeaconRequest({
        sendBeacon,
        sendFetchRequest,
      });

      return sendBeaconRequest("https://example.com/endpoint", body).then(
        (result) => {
          expect(sendFetchRequest).not.toHaveBeenCalled();
          expect(result.statusCode).toBe(204);
          expect(result.getHeader("Content-Type")).toBeNull();
          expect(result.body).toBe("");
        },
      );
    }),
  );
});
