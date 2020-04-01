/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import ensureRequestHasIdentityFactory from "../../../../../src/components/Identity/ensureRequestHasIdentityFactory";
import flushPromiseChains from "../../../helpers/flushPromiseChains";
import { defer } from "../../../../../src/utils";

describe("Identity::ensureRequestHasIdentityFactory", () => {
  let doesIdentityCookieExist;
  let setDomainForInitialIdentityPayload;
  let addEcidFromLegacyToPayloadPromise;
  let addEcidFromLegacyToPayload;
  let awaitIdentityCookieDeferred;
  let awaitIdentityCookie;
  let logger;
  let ensureRequestHasIdentity;

  beforeEach(() => {
    doesIdentityCookieExist = jasmine
      .createSpy("doesIdentityCookieExist")
      .and.returnValue(false);
    setDomainForInitialIdentityPayload = jasmine.createSpy(
      "setDomainForInitialIdentityPayload"
    );
    addEcidFromLegacyToPayloadPromise = Promise.resolve();
    addEcidFromLegacyToPayload = jasmine
      .createSpy("addEcidFromLegacyToPayload")
      .and.returnValue(addEcidFromLegacyToPayloadPromise);
    awaitIdentityCookieDeferred = defer();
    awaitIdentityCookie = jasmine
      .createSpy("awaitIdentityCookie")
      .and.returnValue(awaitIdentityCookieDeferred.promise);
    logger = jasmine.createSpyObj("logger", ["log"]);
    ensureRequestHasIdentity = ensureRequestHasIdentityFactory({
      doesIdentityCookieExist,
      setDomainForInitialIdentityPayload,
      addEcidFromLegacyToPayload,
      awaitIdentityCookie,
      logger
    });
  });

  it("returns resolved promise if identity cookie exists", () => {
    doesIdentityCookieExist.and.returnValue(true);
    return expectAsync(ensureRequestHasIdentity({})).toBeResolved();
  });

  it("allows first request to proceed and pauses subsequent requests until identity cookie exists", () => {
    const payload1 = { type: "payload1" };
    const onResponse1 = () => {};
    const payload2 = { type: "payload2" };
    const onResponse2 = () => {};

    return ensureRequestHasIdentity({
      payload: payload1,
      onResponse: onResponse1
    }).then(() => {
      expect(logger.log).not.toHaveBeenCalled();
      expect(awaitIdentityCookie).toHaveBeenCalledWith(onResponse1);
      expect(setDomainForInitialIdentityPayload).toHaveBeenCalledWith(payload1);
      expect(addEcidFromLegacyToPayload).toHaveBeenCalledWith(payload1);

      const completeHandler = jasmine.createSpy("completeHandler");
      ensureRequestHasIdentity({
        payload: payload2,
        onResponse: onResponse2
      }).then(completeHandler);
      expect(logger.log).toHaveBeenCalledWith(
        "Delaying request while retrieving ECID from server."
      );
      return flushPromiseChains()
        .then(() => {
          expect(completeHandler).not.toHaveBeenCalled();
          awaitIdentityCookieDeferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(logger.log).toHaveBeenCalledWith(
            "Resuming previously delayed request."
          );
          expect(completeHandler).toHaveBeenCalled();
        });
    });
  });
});
