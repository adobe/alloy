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

import createComponent from "../../../../../src/components/Identity/createComponent";
import { defer } from "../../../../../src/utils";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

describe("Identity::createComponent", () => {
  let ensureSingleIdentity;
  let addEcidQueryToPayload;
  let setLegacyEcid;
  let handleResponseForIdSyncs;
  let getEcidFromResponse;
  let component;
  let getIdentity;
  let consentDeferred;
  let consent;
  let getIdentityDeferred;
  let response;

  beforeEach(() => {
    ensureSingleIdentity = jasmine.createSpy("ensureSingleIdentity");
    addEcidQueryToPayload = jasmine.createSpy("addEcidQueryToPayload");
    setLegacyEcid = jasmine.createSpy("setLegacyEcid");
    handleResponseForIdSyncs = jasmine.createSpy("handleResponseForIdSyncs");
    getEcidFromResponse = jasmine.createSpy("getEcidFromResponse");
    getIdentityDeferred = defer();
    consentDeferred = defer();
    consent = jasmine.createSpyObj("consent", {
      awaitConsent: consentDeferred.promise
    });
    getIdentity = jasmine
      .createSpy("getIdentity")
      .and.returnValue(getIdentityDeferred.promise);
    component = createComponent({
      ensureSingleIdentity,
      addEcidQueryToPayload,
      setLegacyEcid,
      handleResponseForIdSyncs,
      getEcidFromResponse,
      getIdentity,
      consent
    });
    response = jasmine.createSpyObj("response", ["getEdge"]);
  });

  it("adds ECID query to event", () => {
    const payload = { type: "payload" };
    const request = {
      getPayload() {
        return payload;
      }
    };
    const onResponse = jasmine.createSpy("onResponse");
    component.lifecycle.onBeforeRequest({ request, onResponse });
    expect(addEcidQueryToPayload).toHaveBeenCalledWith(payload);
  });

  it("ensures request has identity", () => {
    const payload = { type: "payload" };
    const request = {
      getPayload() {
        return payload;
      }
    };
    const onResponse = jasmine.createSpy("onResponse");
    const onRequestFailure = jasmine.createSpy("onRequestFailure");
    const ensureSingleIdentityPromise = Promise.resolve();
    ensureSingleIdentity.and.returnValue(ensureSingleIdentityPromise);
    const result = component.lifecycle.onBeforeRequest({
      request,
      onResponse,
      onRequestFailure
    });
    expect(ensureSingleIdentity).toHaveBeenCalledWith({
      request,
      onResponse,
      onRequestFailure
    });
    expect(result).toBe(ensureSingleIdentityPromise);
  });

  it("does not create legacy identity cookie if response does not contain ECID", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.and.returnValue(idSyncsPromise);
    component.lifecycle.onResponse({ response });
    expect(getEcidFromResponse).toHaveBeenCalledWith(response);
    expect(setLegacyEcid).not.toHaveBeenCalled();
  });

  it("creates legacy identity cookie if response contains ECID", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.and.returnValue(idSyncsPromise);
    getEcidFromResponse.and.returnValue("user@adobe");
    component.lifecycle.onResponse({ response });
    expect(getEcidFromResponse).toHaveBeenCalledWith(response);
    expect(setLegacyEcid).toHaveBeenCalledWith("user@adobe");

    component.lifecycle.onResponse({ response });
    expect(getEcidFromResponse).toHaveBeenCalledTimes(1);
    expect(setLegacyEcid).toHaveBeenCalledTimes(1);
  });

  it("handles ID syncs", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.and.returnValue(idSyncsPromise);
    const result = component.lifecycle.onResponse({ response });
    expect(handleResponseForIdSyncs).toHaveBeenCalledWith(response);
    return expectAsync(result).toBeResolvedTo(undefined);
  });

  it("getIdentity command should make a request when ecid is not available", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.and.returnValue(idSyncsPromise);
    const onResolved = jasmine.createSpy("onResolved");
    response.getEdge.and.returnValue({ regionId: 42 });
    component.commands.getIdentity
      .run({ namespaces: ["ECID"] })
      .then(onResolved);

    return flushPromiseChains()
      .then(() => {
        expect(getIdentity).not.toHaveBeenCalled();
        expect(onResolved).not.toHaveBeenCalled();
        consentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(getIdentity).toHaveBeenCalled();
        getEcidFromResponse.and.returnValue("user@adobe");
        component.lifecycle.onResponse({ response });
        getIdentityDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(onResolved).toHaveBeenCalledWith({
          identity: {
            ECID: "user@adobe"
          },
          edge: {
            regionId: 42
          }
        });
      });
  });

  it("getIdentity command should not make a request when ecid is available", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.and.returnValue(idSyncsPromise);
    getEcidFromResponse.and.returnValue("user@adobe");
    response.getEdge.and.returnValue({ regionId: 7 });
    component.lifecycle.onResponse({ response });
    const onResolved = jasmine.createSpy("onResolved");
    component.commands.getIdentity.run().then(onResolved);
    return flushPromiseChains()
      .then(() => {
        expect(getIdentity).not.toHaveBeenCalled();
        expect(onResolved).not.toHaveBeenCalled();
        consentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(getIdentity).not.toHaveBeenCalled();
        expect(onResolved).toHaveBeenCalledWith({
          identity: {
            ECID: "user@adobe"
          },
          edge: {
            regionId: 7
          }
        });
      });
  });
});
