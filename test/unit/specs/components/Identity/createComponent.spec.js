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
  let addEcidQueryToEvent;
  let customerIds;
  let ensureRequestHasIdentity;
  let createLegacyIdentityCookie;
  let handleResponseForIdSyncs;
  let getEcidFromResponse;
  let component;
  let getEcid;
  let consentDeferred;
  let consent;
  let getEcidPromise;
  beforeEach(() => {
    addEcidQueryToEvent = jasmine.createSpy("addEcidQueryToEvent");
    customerIds = jasmine.createSpyObj("customerIds", ["addToPayload", "sync"]);
    ensureRequestHasIdentity = jasmine.createSpy("ensureRequestHasIdentity");
    createLegacyIdentityCookie = jasmine.createSpy(
      "createLegacyIdentityCookie"
    );
    handleResponseForIdSyncs = jasmine.createSpy("handleResponseForIdSyncs");
    getEcidFromResponse = jasmine.createSpy("getEcidFromResponse");
    getEcidPromise = defer();
    consentDeferred = defer();
    consent = jasmine.createSpyObj("consent", {
      awaitConsent: consentDeferred.promise
    });
    getEcid = jasmine
      .createSpy("getEcid")
      .and.returnValue(getEcidPromise.promise);
    component = createComponent({
      addEcidQueryToEvent,
      customerIds,
      ensureRequestHasIdentity,
      createLegacyIdentityCookie,
      handleResponseForIdSyncs,
      getEcidFromResponse,
      getEcid,
      consent
    });
  });

  it("adds ECID query to event", () => {
    const event = { type: "event" };
    component.lifecycle.onBeforeEvent({ event });
    expect(addEcidQueryToEvent).toHaveBeenCalledWith(event);
  });

  it("adds customer IDs to request payload", () => {
    const payload = { type: "payload" };
    const onResponse = jasmine.createSpy("onResponse");
    component.lifecycle.onBeforeRequest({ payload, onResponse });
    expect(customerIds.addToPayload).toHaveBeenCalledWith(payload);
  });

  it("ensures request has identity", () => {
    const payload = { type: "payload" };
    const onResponse = jasmine.createSpy("onResponse");
    const ensureRequestHasIdentityPromise = Promise.resolve();
    ensureRequestHasIdentity.and.returnValue(ensureRequestHasIdentityPromise);
    const result = component.lifecycle.onBeforeRequest({ payload, onResponse });
    expect(ensureRequestHasIdentity).toHaveBeenCalledWith({
      payload,
      onResponse
    });
    expect(result).toBe(ensureRequestHasIdentityPromise);
  });

  it("does not create legacy identity cookie if response does not contain ECID", () => {
    const response = { type: "response" };
    component.lifecycle.onResponse({ response });
    expect(getEcidFromResponse).toHaveBeenCalledWith(response);
    expect(createLegacyIdentityCookie).not.toHaveBeenCalled();
  });

  it("creates legacy identity cookie if response contains ECID", () => {
    getEcidFromResponse.and.returnValue("user@adobe");
    const response = { type: "response" };
    component.lifecycle.onResponse({ response });
    expect(getEcidFromResponse).toHaveBeenCalledWith(response);
    expect(createLegacyIdentityCookie).toHaveBeenCalledWith("user@adobe");

    component.lifecycle.onResponse({ response });
    expect(getEcidFromResponse).toHaveBeenCalledTimes(1);
    expect(createLegacyIdentityCookie).toHaveBeenCalledTimes(1);
  });

  it("handles ID syncs", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.and.returnValue(idSyncsPromise);
    const response = { type: "response" };
    const result = component.lifecycle.onResponse({ response });
    expect(handleResponseForIdSyncs).toHaveBeenCalledWith(response);
    expect(result).toBe(idSyncsPromise);
  });

  it("sets customer IDs", () => {
    const ids = { type: "customerIds" };
    component.commands.setCustomerIds.run(ids);
    expect(customerIds.sync).toHaveBeenCalledWith(ids);
  });

  it("getEcid command should make a request when ecid is not available", () => {
    let ecid;
    component.commands.getEcid.run().then(id => {
      ecid = id;
    });

    return flushPromiseChains()
      .then(() => {
        expect(getEcid).not.toHaveBeenCalled();
        expect(ecid).toBe(undefined);
        consentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(getEcid).toHaveBeenCalled();
        getEcidFromResponse.and.returnValue("user@adobe");
        const response = { type: "response" };
        component.lifecycle.onResponse({ response });
        getEcidPromise.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(ecid).toBe("user@adobe");
      });
  });

  it("getEcid command should not make a request when ecid is available", () => {
    getEcidFromResponse.and.returnValue("user@adobe");
    const response = { type: "response" };
    component.lifecycle.onResponse({ response });
    let ecid;
    component.commands.getEcid.run().then(id => {
      ecid = id;
    });
    return flushPromiseChains()
      .then(() => {
        expect(getEcid).not.toHaveBeenCalled();
        expect(ecid).toBe(undefined);
        consentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(getEcid).not.toHaveBeenCalled();
        expect(ecid).toBe("user@adobe");
      });
  });
});
