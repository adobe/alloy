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

import { cookieJar } from "../../../../../src/utils";
import createMigration from "../../../../../src/components/Identity/createMigration";

describe("createMigration", () => {
  let migration;

  beforeEach(() => {
    cookieJar.remove("AMCV_TEST_ORG");
    cookieJar.remove("s_ecid");
    migration = createMigration("TEST_ORG");
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
    it("should create an AMCV cookie with the value passed", () => {
      migration.createLegacyCookie("1234");
      expect(cookieJar.get("AMCV_TEST_ORG")).toEqual("MCMID|1234");
    });
    it("should not write AMCV cookie if already present", () => {
      const cookieValue = "existing value";
      cookieJar.set("AMCV_TEST_ORG", cookieValue);
      migration.createLegacyCookie("1234");
      expect(cookieJar.get("AMCV_TEST_ORG")).toEqual(cookieValue);
    });
  });
});
