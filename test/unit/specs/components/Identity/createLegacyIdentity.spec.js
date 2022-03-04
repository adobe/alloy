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

import createLegacyIdentity from "../../../../../src/components/Identity/createLegacyIdentity";

describe("Identity::createLegacyIdentity", () => {
  let idMigrationEnabled;
  let orgId;
  let getEcidFromVisitor;
  let apexDomain;
  let isPageSsl;
  let cookieJar;

  let legacyIdentity;

  beforeEach(() => {
    idMigrationEnabled = true;
    orgId = "TEST_ORG";
    getEcidFromVisitor = jasmine
      .createSpy("getEcidFromVisitor")
      .and.returnValue(Promise.resolve());
    apexDomain = "mydomain";
    isPageSsl = true;
    cookieJar = jasmine.createSpyObj("cookieJar", ["get", "set"]);

    legacyIdentity = undefined;
  });

  const build = () => {
    legacyIdentity = createLegacyIdentity({
      config: {
        idMigrationEnabled,
        orgId
      },
      getEcidFromVisitor,
      apexDomain,
      isPageSsl,
      cookieJar
    });
  };

  describe("getEcid", () => {
    it("should return a promise resolved with undefined if ID migration disabled", async () => {
      idMigrationEnabled = false;
      build();
      const result = await legacyIdentity.getEcid();
      expect(result).toBeUndefined();
      expect(cookieJar.get).not.toHaveBeenCalled();
    });

    it("should return promise resolved with undefined if no AMCV cookie or s_ecid cookie is present", async () => {
      build();
      const result = await legacyIdentity.getEcid();
      expect(result).toBeUndefined();
    });

    [
      "random|string|MCMID|1234|random|random",
      "MCMID|1234|random|random",
      "random|random|MCMID|1234",
      "MCMID|1234"
    ].forEach(cookieValue => {
      it(`should return promise resolved with ECID if AMCV cookie is ${cookieValue}`, async () => {
        cookieJar.get.and.callFake(cookieName =>
          cookieName === "AMCV_TEST_ORG" ? cookieValue : undefined
        );
        build();
        expect(await legacyIdentity.getEcid()).toEqual("1234");
      });

      it(`should return promise resolved with ECID if s_ecid cookie is ${cookieValue}`, async () => {
        cookieJar.get.and.callFake(cookieName =>
          cookieName === "s_ecid" ? cookieValue : undefined
        );
        build();
        expect(await legacyIdentity.getEcid()).toEqual("1234");
      });
    });

    it("should return promise resolved with undefined cookie does not contain MCMID", async () => {
      const cookieValue = "version|0.0.4";
      cookieJar.get.and.returnValue(cookieValue);
      build();
      expect(await legacyIdentity.getEcid()).toBeUndefined();
    });

    it("should request ECID from visitor ID Service if legacy ECID cookies are missing", async () => {
      getEcidFromVisitor.and.returnValue(Promise.resolve("visitor_ecid"));
      build();
      expect(await legacyIdentity.getEcid()).toEqual("visitor_ecid");
    });
  });

  describe("setEcid", () => {
    it("should not write AMCV cookie if ID migration disabled", () => {
      idMigrationEnabled = false;
      build();
      legacyIdentity.setEcid("1234");
      expect(cookieJar.set).not.toHaveBeenCalled();
    });

    it("writes a secure AMCV cookie", () => {
      build();
      legacyIdentity.setEcid("1234");
      expect(cookieJar.set).toHaveBeenCalledOnceWith(
        "AMCV_TEST_ORG",
        "MCMID|1234",
        {
          domain: "mydomain",
          expires: 390,
          sameSite: "none",
          secure: true
        }
      );
    });

    it("writes an insecure AMCV cookie", () => {
      isPageSsl = false;
      build();
      legacyIdentity.setEcid("1234");
      expect(cookieJar.set).toHaveBeenCalledOnceWith(
        "AMCV_TEST_ORG",
        "MCMID|1234",
        {
          domain: "mydomain",
          expires: 390
        }
      );
    });

    it("should not write AMCV cookie if already present", () => {
      cookieJar.get.and.returnValue("existing value");
      build();
      legacyIdentity.setEcid("1234");
      expect(cookieJar.set).not.toHaveBeenCalled();
    });
  });
});
