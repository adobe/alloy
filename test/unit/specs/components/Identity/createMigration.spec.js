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
import removeAllCookies from "../../../helpers/removeAllCookies";

describe("Identity::createMigration", () => {
  let idMigrationEnabled;
  let migration;

  const build = () => {
    migration = createMigration({
      idMigrationEnabled,
      orgId: "TEST_ORG"
    });
  };

  beforeEach(() => {
    idMigrationEnabled = true;
  });

  afterEach(removeAllCookies);

  describe("getEcidFromLegacy", () => {
    it("should return a promise resolved with undefined if ID migration disabled", () => {
      idMigrationEnabled = false;
      build();
      return expectAsync(migration.getEcidFromLegacy()).toBeResolvedTo(
        undefined
      );
    });

    it("should return promise resolved with undefined if no AMCV cookie or s_ecid cookie is present", () => {
      build();
      return expectAsync(migration.getEcidFromLegacy()).toBeResolvedTo(
        undefined
      );
    });

    [
      "random|string|MCMID|1234|random|random",
      "MCMID|1234|random|random",
      "random|random|MCMID|1234",
      "MCMID|1234"
    ].forEach(cookieValue => {
      it(`should return promise resolved with ECID if AMCV cookie is ${cookieValue}`, () => {
        cookieJar.set("AMCV_TEST_ORG", cookieValue);
        build();
        return expectAsync(migration.getEcidFromLegacy()).toBeResolvedTo(
          "1234"
        );
      });

      it(`should return promise resolved with ECID if s_ecid cookie is ${cookieValue}`, () => {
        cookieJar.set("s_ecid", cookieValue);
        build();
        return expectAsync(migration.getEcidFromLegacy()).toBeResolvedTo(
          "1234"
        );
      });
    });

    it("should return promise resolved with undefined if AMCV does not contain MCMID", () => {
      const cookieValue = "version|0.0.4";
      cookieJar.set("AMCV_NO_MID", cookieValue);
      build();
      return expectAsync(migration.getEcidFromLegacy()).toBeResolvedTo(
        undefined
      );
    });

    it("should return promise resolved with undefined if s_ecid does not contain MCMID", () => {
      const cookieValue = "version|0.0.4";
      cookieJar.set("s_ecid", cookieValue);
      build();
      return expectAsync(migration.getEcidFromLegacy()).toBeResolvedTo(
        undefined
      );
    });
  });

  describe("createLegacyIdentityCookie", () => {
    it("should not write AMCV cookie if ID migration disabled", () => {
      idMigrationEnabled = false;
      build();
      migration.createLegacyIdentityCookie("1234");
      expect(cookieJar.get("AMCV_TEST_ORG")).toBeUndefined();
    });
    it("should not write AMCV cookie if already present", () => {
      build();
      const cookieValue = "existing value";
      cookieJar.set("AMCV_TEST_ORG", cookieValue);
      migration.createLegacyIdentityCookie("1234");
      expect(cookieJar.get("AMCV_TEST_ORG")).toEqual(cookieValue);
    });
  });
});
