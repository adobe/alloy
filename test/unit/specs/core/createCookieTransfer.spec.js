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

import createCookieTransfer from "../../../../src/core/createCookieTransfer";

describe("createCookieTransfer", () => {
  const orgId = "ABC@CustomOrg";
  const apexDomain = "example.com";
  const endpointDomain = "thirdparty.com";
  let payload;
  let cookieJar;
  let cookieTransfer;

  beforeEach(() => {
    payload = jasmine.createSpyObj("payload", ["mergeState"]);
    cookieJar = jasmine.createSpyObj("cookieJar", ["get", "set"]);
  });

  describe("cookiesToPayload", () => {
    it("does not transfer cookies to payload if endpoint is first-party", () => {
      cookieTransfer = createCookieTransfer({
        cookieJar,
        orgId,
        apexDomain
      });
      cookieTransfer.cookiesToPayload(payload, "edge.example.com");
      expect(payload.mergeState).toHaveBeenCalledWith({
        domain: apexDomain,
        cookiesEnabled: true
      });
    });

    it("does not set state.entries if there are no qualifying cookies", () => {
      cookieJar.get.and.returnValue({});
      cookieTransfer = createCookieTransfer({
        cookieJar,
        orgId,
        apexDomain
      });
      cookieTransfer.cookiesToPayload(payload, endpointDomain);
      expect(payload.mergeState).toHaveBeenCalledWith({
        domain: apexDomain,
        cookiesEnabled: true
      });
    });

    it("transfers eligible cookies to payload", () => {
      cookieJar.get.and.returnValue({
        kndctr_ABC_CustomOrg_identity: "XYZ@CustomOrg",
        ineligible_cookie: "foo",
        kndctr_ABC_CustomOrg_optIn: "all"
      });
      cookieTransfer = createCookieTransfer({
        cookieJar,
        orgId,
        apexDomain
      });
      cookieTransfer.cookiesToPayload(payload, endpointDomain);
      expect(payload.mergeState).toHaveBeenCalledWith({
        domain: apexDomain,
        cookiesEnabled: true,
        entries: [
          {
            key: "kndctr_ABC_CustomOrg_identity",
            value: "XYZ@CustomOrg"
          },
          {
            key: "kndctr_ABC_CustomOrg_optIn",
            value: "all"
          }
        ]
      });
    });
  });

  describe("responseToCookies", () => {
    it("transfers state to cookies", () => {
      cookieTransfer = createCookieTransfer({
        cookieJar,
        orgId,
        apexDomain
      });

      const response = {
        getPayloadsByType() {
          return [
            {
              key: "kndctr_ABC_CustomOrg_identity",
              value: "XYZ@CustomOrg",
              maxAge: 172800
            },
            {
              key: "kndctr_ABC_CustomOrg_optIn",
              value: "all"
            }
          ];
        }
      };

      cookieTransfer.responseToCookies(response);

      expect(cookieJar.set).toHaveBeenCalledWith(
        "kndctr_ABC_CustomOrg_identity",
        "XYZ@CustomOrg",
        { expires: 2, domain: "example.com" }
      );

      expect(cookieJar.set).toHaveBeenCalledWith(
        "kndctr_ABC_CustomOrg_optIn",
        "all",
        { domain: "example.com" }
      );
    });
  });
});
