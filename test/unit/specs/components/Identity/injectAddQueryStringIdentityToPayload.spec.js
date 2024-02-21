/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import injectAddQueryStringIdentityToPayload from "../../../../../src/components/Identity/injectAddQueryStringIdentityToPayload";
import createDataCollectionRequestPayload from "../../../../../src/utils/request/createDataCollectionRequestPayload";
import createIdentityRequestPayload from "../../../../../src/components/Identity/getIdentity/createIdentityRequestPayload";
import createConsentRequestPayload from "../../../../../src/components/Privacy/createConsentRequestPayload";

describe("Identity::injectAddQueryStringIdentityToPayload", () => {
  let locationSearch;
  let dateProvider;
  let orgId;
  let logger;
  let date;
  let payload;

  beforeEach(() => {
    dateProvider = () => date;
    locationSearch =
      "?foo=bar&adobe_mc=TS%3D1641432103%7CMCMID%3D77094828402023918047117570965393734545%7CMCORGID%3DFAF554945B90342F0A495E2C%40AdobeOrg&a=b";
    date = new Date(1641432103 * 1000);
    orgId = "FAF554945B90342F0A495E2C@AdobeOrg";
    logger = jasmine.createSpyObj("logger", ["info", "warn"]);
  });

  const run = () => {
    injectAddQueryStringIdentityToPayload({
      locationSearch,
      dateProvider,
      orgId,
      logger
    })(payload);
  };

  [
    [
      "DataCollection",
      createDataCollectionRequestPayload,
      p => p.xdm.identityMap
    ],
    ["Identity", createIdentityRequestPayload, p => p.xdm.identityMap],
    ["Consent", createConsentRequestPayload, p => p.identityMap]
  ].forEach(([type, createPayload, getIdentityMap]) => {
    describe(`with ${type} payload`, () => {
      beforeEach(() => {
        payload = createPayload();
      });

      it("adds the identity", () => {
        run();
        expect(getIdentityMap(payload.toJSON())).toEqual({
          ECID: [
            {
              id: "77094828402023918047117570965393734545"
            }
          ]
        });
      });

      it("doesn't overwrite an existing identity in the identityMap", () => {
        payload.addIdentity("ECID", { id: "1234" });
        run();
        expect(getIdentityMap(payload.toJSON())).toEqual({
          ECID: [
            {
              id: "1234"
            }
          ]
        });
      });
    });
  });

  describe("with mock payload", () => {
    beforeEach(() => {
      payload = jasmine.createSpyObj("payload", ["addIdentity", "hasIdentity"]);
      payload.hasIdentity.and.returnValue(false);
    });

    it("doesn't do anything when there is no query string", () => {
      locationSearch = "";
      run();
      expect(payload.addIdentity).not.toHaveBeenCalled();
    });

    it("doesn't do anything when there is no TS parameter", () => {
      locationSearch = `?adobe_mc=${encodeURIComponent(
        "MCMID=myid|MCORG=myorg"
      )}`;
      run();
      expect(payload.addIdentity).not.toHaveBeenCalled();
    });

    it("doesn't do anything when there is no MCMID parameter", () => {
      locationSearch = `?adobe_mc=${encodeURIComponent("TS=1000|MCORG=myorg")}`;
      run();
      expect(payload.addIdentity).not.toHaveBeenCalled();
    });

    it("doesn't do anything when there is no MCORG parameter", () => {
      locationSearch = `?adobe_mc=${encodeURIComponent("TS=1000|MCMID=myid")}`;
      run();
      expect(payload.addIdentity).not.toHaveBeenCalled();
    });

    it("doesn't do anything with an expired link", () => {
      date = new Date((1641432103 + 301) * 1000);
      run();
      expect(payload.addIdentity).not.toHaveBeenCalled();
    });

    it("adds the identity for an exactly 5 minute old link", () => {
      date = new Date((1641432103 + 300) * 1000);
      run();
      expect(payload.addIdentity).toHaveBeenCalled();
    });

    it("doesn't do anything when the orgs don't match", () => {
      orgId = "myotherorg";
      run();
      expect(payload.addIdentity).not.toHaveBeenCalled();
    });

    [
      "adobe_mc=",
      "adobe_mc=a",
      "adobe_mc=a%3Db",
      "adobe_mc=%7C%7C",
      `adobe_mc=${encodeURIComponent(
        "TS=foo|MCMID=12345|MCORGID=FAF554945B90342F0A495E2C@AdobeOrg"
      )}`,
      `adobe_mc=${encodeURIComponent(
        "TS=1641432103|MCMID=|MCORGID=FAF554945B90342F0A495E2C@AdobeOrg"
      )}`,
      `adobe_mc=${encodeURIComponent("TS|MCMID")}`
    ].forEach(value => {
      it(`handles garbage parameter value: ${value}`, () => {
        locationSearch = `?${value}`;
        run();
        expect(payload.addIdentity).not.toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledOnceWith(
          jasmine.stringMatching(/invalid/)
        );
      });
    });

    it("reads an identity from visitor", () => {
      locationSearch =
        "?adobe_mc=MCMID%3D06387190804794960331430905673364101813%7CMCORGID%3D5BFE274A5F6980A50A495C08%2540AdobeOrg%7CTS%3D1653516560";
      orgId = "5BFE274A5F6980A50A495C08@AdobeOrg";
      date = new Date(1653516560 * 1000);
      run();
      expect(payload.addIdentity).toHaveBeenCalledOnceWith("ECID", {
        id: "06387190804794960331430905673364101813"
      });
    });

    it("handles multiple copies of the adobe_mc param", () => {
      locationSearch =
        "?adobe_mc=MCMID%3Dfirst%7CMCORGID%3Dabc%7CTS%3D1653516560&adobe_mc=MCMID%3Dsecond%7CMCORGID%3Dabc%7CTS%3D1653516560";
      orgId = "abc";
      date = new Date(1653516560 * 1000);
      run();
      expect(payload.addIdentity).toHaveBeenCalledOnceWith("ECID", {
        id: "second"
      });
      expect(logger.warn).toHaveBeenCalled();
    });

    it("handles multiple copies of the adobe_mc param with empty param", () => {
      locationSearch =
        "?adobe_mc=MCMID%3Dfirst%7CMCORGID%3Dabc%7CTS%3D1653516560&adobe_mc=";
      orgId = "abc";
      date = new Date(1653516560 * 1000);
      run();
      expect(payload.addIdentity).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalled();
    });
  });
});
