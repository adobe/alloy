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

import { vi, beforeEach, describe, it, expect } from "vitest";
import createCookieTransfer from "../../../../src/core/createCookieTransfer.js";

describe("createCookieTransfer", () => {
  let apexDomain;
  const endpointDomain = "thirdparty.com";
  let shouldTransferCookie;
  let payload;
  let cookieJar;
  let cookieTransfer;
  const date = new Date();
  const dateProvider = () => date;
  beforeEach(() => {
    apexDomain = "example.com";
    shouldTransferCookie = vi.fn();
    shouldTransferCookie.mockReturnValue(false);
    payload = {
      mergeState: vi.fn(),
    };
    cookieJar = {
      get: vi.fn(),
      set: vi.fn(),
    };
  });
  const build = () => {
    cookieTransfer = createCookieTransfer({
      cookieJar,
      shouldTransferCookie,
      apexDomain,
      dateProvider,
    });
  };
  describe("cookiesToPayload", () => {
    it("does not transfer cookies to payload if endpoint is first-party", () => {
      build();
      cookieTransfer.cookiesToPayload(payload, "edge.example.com");
      expect(payload.mergeState).toHaveBeenCalledWith({
        domain: apexDomain,
        cookiesEnabled: true,
      });
    });
    it("does not set state.entries if there are no qualifying cookies", () => {
      cookieJar.get.mockReturnValue({});
      build();
      cookieTransfer.cookiesToPayload(payload, endpointDomain);
      expect(payload.mergeState).toHaveBeenCalledWith({
        domain: apexDomain,
        cookiesEnabled: true,
      });
    });
    ["example.com", ""].forEach((domain) => {
      it(`transfers eligible cookies to payload with domain ${domain}`, () => {
        apexDomain = domain;
        build();
        cookieJar.get.mockReturnValue({
          kndctr_ABC_CustomOrg_identity: "XYZ@CustomOrg",
          ineligible_cookie: "foo",
          kndctr_ABC_CustomOrg_optIn: "all",
          at_qa_mode:
            '{"token":"QATokenString","listedActivitiesOnly":true,"evaluateAsTrueAudienceIds":["2480042"],"previewIndexes":[{"activityIndex":1,"experienceIndex":1}]}',
        });
        shouldTransferCookie
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(false)
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(true);
        cookieTransfer.cookiesToPayload(payload, endpointDomain);
        expect(payload.mergeState).toHaveBeenCalledWith({
          domain: apexDomain,
          cookiesEnabled: true,
          entries: [
            {
              key: "kndctr_ABC_CustomOrg_identity",
              value: "XYZ@CustomOrg",
            },
            {
              key: "kndctr_ABC_CustomOrg_optIn",
              value: "all",
            },
            {
              key: "at_qa_mode",
              value:
                '{"token":"QATokenString","listedActivitiesOnly":true,"evaluateAsTrueAudienceIds":["2480042"],"previewIndexes":[{"activityIndex":1,"experienceIndex":1}]}',
            },
          ],
        });
      });
    });
  });
  describe("responseToCookies", () => {
    let response;
    beforeEach(() => {
      response = {
        getPayloadsByType: vi.fn(),
      };
    });
    it("adds a cookie with the correct domain", () => {
      build();
      response.getPayloadsByType.mockReturnValue([
        {
          key: "mykey",
          value: "myvalue",
        },
      ]);
      cookieTransfer.responseToCookies(response);
      expect(cookieJar.set).toHaveBeenNthCalledWith(1, "mykey", "myvalue", {
        domain: "example.com",
      });
    });
    it("adds multiple cookies", () => {
      build();
      response.getPayloadsByType.mockReturnValue([
        {
          key: "mykey1",
          value: "myvalue1",
        },
        {
          key: "mykey2",
          value: "myvalue2",
        },
      ]);
      cookieTransfer.responseToCookies(response);
      expect(cookieJar.set).toHaveBeenCalledWith(
        "mykey1",
        "myvalue1",
        expect.any(Object),
      );
      expect(cookieJar.set).toHaveBeenCalledWith(
        "mykey2",
        "myvalue2",
        expect.any(Object),
      );
    });
    it("sets the expires attribute", () => {
      build();
      response.getPayloadsByType.mockReturnValue([
        {
          key: "mykey",
          value: "myvalue",
          maxAge: 172800, // 24 * 60 * 60 * 2
        },
      ]);
      cookieTransfer.responseToCookies(response);
      expect(cookieJar.set.mock.calls[0][2].expires.getTime()).toEqual(
        date.getTime() + 172800 * 1000,
      );
    });
    it("adds a sameSite=none cookie with secure attribute", () => {
      build();
      response.getPayloadsByType.mockReturnValue([
        {
          key: "mykey",
          value: "myvalue",
          attrs: {
            SameSite: "None",
          },
        },
      ]);
      cookieTransfer.responseToCookies(response);
      expect(cookieJar.set.mock.calls[0][2].sameSite).toEqual("none");
      expect(cookieJar.set.mock.calls[0][2].secure).toEqual(true);
    });
    it("adds a sameSite=strict cookie", () => {
      build();
      response.getPayloadsByType.mockReturnValue([
        {
          key: "mykey",
          value: "myvalue",
          attrs: {
            SameSite: "Strict",
          },
        },
      ]);
      cookieTransfer.responseToCookies(response);
      expect(cookieJar.set.mock.calls[0][2].sameSite).toEqual("strict");
      expect(cookieJar.set.mock.calls[0][2].secure).toBeUndefined();
    });
  });
});
