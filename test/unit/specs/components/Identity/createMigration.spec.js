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

import { cookieJar, defer } from "../../../../../src/utils";
import createMigration from "../../../../../src/components/Identity/createMigration";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

describe("createMigration", () => {
  let migration;
  let consentDeferred;
  let consent;

  beforeEach(() => {
    cookieJar.remove("AMCV_TEST_ORG");
    cookieJar.remove("s_ecid");
    consentDeferred = defer();
    consent = jasmine.createSpyObj("consent", {
      whenConsented: consentDeferred.promise
    });
    migration = createMigration({
      orgId: "TEST_ORG",
      consent
    });
  });

  describe("getEcidFromLegacyCookies", () => {
    it("should return null if no AMCV cookie or s_ecid cookie is present", () => {
      expect(migration.getEcidFromLegacyCookies()).toBeNull();
    });

    [
      "random|string|MCMID|1234|random|random",
      "MCMID|1234|random|random",
      "random|random|MCMID|1234",
      "MCMID|1234"
    ].forEach(cookieValue => {
      it(`should return ECID if AMCV cookie is ${cookieValue}`, () => {
        cookieJar.set("AMCV_TEST_ORG", cookieValue);
        expect(migration.getEcidFromLegacyCookies()).toEqual("1234");
      });

      it(`should return ECID if s_ecid cookie is ${cookieValue}`, () => {
        cookieJar.set("s_ecid", cookieValue);
        expect(migration.getEcidFromLegacyCookies()).toEqual("1234");
      });
    });

    it("should return null if AMCV does not contain MCMID", () => {
      const cookieValue = "version|0.0.4";
      cookieJar.set("AMCV_NO_MID", cookieValue);
      expect(migration.getEcidFromLegacyCookies()).toBeNull();
    });

    it("should return null if s_ecid does not contain MCMID", () => {
      const cookieValue = "version|0.0.4";
      cookieJar.set("s_ecid", cookieValue);
      expect(migration.getEcidFromLegacyCookies()).toBeNull();
    });
  });
  describe("createLegacyCookie", () => {
    it("waits for consent and creates an AMCV cookie with the value passed", () => {
      migration.createLegacyCookie("1234");

      return flushPromiseChains()
        .then(() => {
          expect(cookieJar.get("AMCV_TEST_ORG")).toBeUndefined();
          consentDeferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(cookieJar.get("AMCV_TEST_ORG")).toEqual("MCMID|1234");
        });
    });
    it("rejects returned promise if consent denied", () => {
      consentDeferred.reject(new Error("Consent denied."));

      return expectAsync(
        migration.createLegacyCookie("123")
      ).toBeRejectedWithError("Consent denied.");
    });
    it("should not write AMCV cookie if already present", () => {
      const cookieValue = "existing value";
      cookieJar.set("AMCV_TEST_ORG", cookieValue);
      return migration.createLegacyCookie("1234").then(() => {
        expect(cookieJar.get("AMCV_TEST_ORG")).toEqual(cookieValue);
      });
    });
  });
});
