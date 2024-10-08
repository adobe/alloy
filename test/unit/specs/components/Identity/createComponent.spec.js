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

import createComponent from "../../../../../src/components/Identity/createComponent.js";
import { defer } from "../../../../../src/utils/index.js";
import flushPromiseChains from "../../../helpers/flushPromiseChains.js";

describe("Identity::createComponent", () => {
  let addEcidQueryToPayload;
  let addQueryStringIdentityToPayload;
  let ensureSingleIdentity;
  let setLegacyEcid;
  let handleResponseForIdSyncs;
  let getNamespacesFromResponse;
  let getIdentity;
  let consent;
  let appendIdentityToUrl;
  let logger;
  let getIdentityOptionsValidator;
  let awaitConsentDeferred;
  let withConsentDeferred;
  let getIdentityDeferred;
  let response;
  let component;

  beforeEach(() => {
    ensureSingleIdentity = jasmine.createSpy("ensureSingleIdentity");
    addEcidQueryToPayload = jasmine.createSpy("addEcidQueryToPayload");
    addQueryStringIdentityToPayload = jasmine.createSpy(
      "addQueryStringIdentityToPayload",
    );
    setLegacyEcid = jasmine.createSpy("setLegacyEcid");
    handleResponseForIdSyncs = jasmine.createSpy("handleResponseForIdSyncs");
    getNamespacesFromResponse = jasmine.createSpy("getNamespacesFromResponse");
    getIdentityDeferred = defer();
    awaitConsentDeferred = defer();
    withConsentDeferred = defer();
    consent = jasmine.createSpyObj("consent", {
      awaitConsent: awaitConsentDeferred.promise,
      withConsent: withConsentDeferred.promise,
    });
    appendIdentityToUrl = jasmine.createSpy("appendIdentityToUrl");
    logger = jasmine.createSpyObj("logger", ["warn"]);
    getIdentity = jasmine
      .createSpy("getIdentity")
      .and.returnValue(getIdentityDeferred.promise);
    getIdentityOptionsValidator = (options) => options;
    component = createComponent({
      ensureSingleIdentity,
      addEcidQueryToPayload,
      addQueryStringIdentityToPayload,
      setLegacyEcid,
      handleResponseForIdSyncs,
      getNamespacesFromResponse,
      getIdentity,
      consent,
      appendIdentityToUrl,
      logger,
      getIdentityOptionsValidator,
    });
    response = jasmine.createSpyObj("response", ["getEdge"]);
  });

  it("adds ECID query to event", () => {
    const payload = { type: "payload" };
    const request = {
      getPayload() {
        return payload;
      },
    };
    const onResponse = jasmine.createSpy("onResponse");
    component.lifecycle.onBeforeRequest({ request, onResponse });
    expect(addEcidQueryToPayload).toHaveBeenCalledWith(payload);
  });

  it("adds the query string identity to the payload", () => {
    const payload = { type: "payload" };
    const request = {
      getPayload() {
        return payload;
      },
    };
    component.lifecycle.onBeforeRequest({ request });
    expect(addQueryStringIdentityToPayload).toHaveBeenCalledOnceWith(payload);
  });

  it("ensures request has identity", () => {
    const payload = { type: "payload" };
    const request = {
      getPayload() {
        return payload;
      },
    };
    const onResponse = jasmine.createSpy("onResponse");
    const onRequestFailure = jasmine.createSpy("onRequestFailure");
    const ensureSingleIdentityPromise = Promise.resolve();
    ensureSingleIdentity.and.returnValue(ensureSingleIdentityPromise);
    const result = component.lifecycle.onBeforeRequest({
      request,
      onResponse,
      onRequestFailure,
    });
    expect(ensureSingleIdentity).toHaveBeenCalledWith({
      request,
      onResponse,
      onRequestFailure,
    });
    expect(result).toBe(ensureSingleIdentityPromise);
  });

  it("does not create legacy identity cookie if response does not contain ECID", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.and.returnValue(idSyncsPromise);
    component.lifecycle.onResponse({ response });
    expect(getNamespacesFromResponse).toHaveBeenCalledWith(response);
    expect(setLegacyEcid).not.toHaveBeenCalled();
  });

  it("creates legacy identity cookie if response contains ECID", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.and.returnValue(idSyncsPromise);
    getNamespacesFromResponse.and.returnValue({ ECID: "user@adobe" });
    component.lifecycle.onResponse({ response });
    expect(getNamespacesFromResponse).toHaveBeenCalledWith(response);
    expect(setLegacyEcid).toHaveBeenCalledWith("user@adobe");

    component.lifecycle.onResponse({ response });
    expect(getNamespacesFromResponse).toHaveBeenCalledTimes(2);
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
    const onResolved2 = jasmine.createSpy("onResolved2");
    response.getEdge.and.returnValue({ regionId: 42 });
    component.commands.getIdentity
      .run({ namespaces: ["ECID"] })
      .then(onResolved);

    return flushPromiseChains()
      .then(() => {
        expect(getIdentity).not.toHaveBeenCalled();
        expect(onResolved).not.toHaveBeenCalled();
        awaitConsentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(getIdentity).toHaveBeenCalled();
        // ECID and CORE are requested regardless of the namespaces passed in.
        getNamespacesFromResponse.and.returnValue({
          ECID: "user@adobe",
          CORE: "mycoreid",
        });
        component.lifecycle.onResponse({ response });
        getIdentityDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(onResolved).toHaveBeenCalledWith({
          identity: {
            ECID: "user@adobe",
          },
          edge: {
            regionId: 42,
          },
        });
        getNamespacesFromResponse.and.returnValue({ CORE: "mycoreid" });
        component.commands.getIdentity
          .run({ namespaces: ["CORE"] })
          .then(onResolved2);
        return flushPromiseChains();
      })
      .then(() => {
        expect(getIdentity).toHaveBeenCalledTimes(1);
        return flushPromiseChains();
      })
      .then(() => {
        expect(onResolved2).toHaveBeenCalledWith({
          identity: {
            CORE: "mycoreid",
          },
          edge: {
            regionId: 42,
          },
        });
      });
  });

  it("getIdentity command should not make a request when ecid is available", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.and.returnValue(idSyncsPromise);
    getNamespacesFromResponse.and.returnValue({ ECID: "user@adobe" });
    response.getEdge.and.returnValue({ regionId: 7 });
    component.lifecycle.onResponse({ response });
    const onResolved = jasmine.createSpy("onResolved");
    component.commands.getIdentity
      .run({ namespaces: ["ECID"] })
      .then(onResolved);
    return flushPromiseChains()
      .then(() => {
        expect(getIdentity).not.toHaveBeenCalled();
        expect(onResolved).not.toHaveBeenCalled();
        awaitConsentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(getIdentity).not.toHaveBeenCalled();
        expect(onResolved).toHaveBeenCalledWith({
          identity: {
            ECID: "user@adobe",
          },
          edge: {
            regionId: 7,
          },
        });
      });
  });

  it("getIdentity command should not make a request when CORE is available", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.and.returnValue(idSyncsPromise);
    getNamespacesFromResponse.and.returnValue({
      ECID: "user@adobe",
      CORE: "mycoreid",
    });
    response.getEdge.and.returnValue({ regionId: 7 });
    component.lifecycle.onResponse({ response });
    const onResolved = jasmine.createSpy("onResolved");
    component.commands.getIdentity
      .run({ namespaces: ["CORE"] })
      .then(onResolved);
    return flushPromiseChains()
      .then(() => {
        expect(getIdentity).not.toHaveBeenCalled();
        expect(onResolved).not.toHaveBeenCalled();
        awaitConsentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(getIdentity).not.toHaveBeenCalled();
        expect(onResolved).toHaveBeenCalledWith({
          identity: {
            CORE: "mycoreid",
          },
          edge: {
            regionId: 7,
          },
        });
      });
  });

  it("getIdentity command is called with configuration overrides, when provided", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.and.returnValue(idSyncsPromise);
    const onResolved = jasmine.createSpy("onResolved");
    response.getEdge.and.returnValue({ regionId: 42 });
    const getIdentityOptions = {
      namespaces: ["ECID"],
      edgeConfigOverrides: {
        com_adobe_identity: {
          idSyncContainerId: "123",
        },
      },
    };
    component.commands.getIdentity.run(getIdentityOptions).then(onResolved);

    return flushPromiseChains()
      .then(() => {
        expect(getIdentity).not.toHaveBeenCalled();
        expect(onResolved).not.toHaveBeenCalled();
        awaitConsentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(getIdentity).toHaveBeenCalledWith(getIdentityOptions);
        getNamespacesFromResponse.and.returnValue({ ECID: "user@adobe" });
        component.lifecycle.onResponse({ response });
        getIdentityDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(onResolved).toHaveBeenCalledWith({
          identity: {
            ECID: "user@adobe",
          },
          edge: {
            regionId: 42,
          },
        });
      });
  });

  it("appendIdentityToUrl should return the unmodified url when consent is not given.", () => {
    const commandPromise = component.commands.appendIdentityToUrl.run({
      url: "myurl",
    });
    withConsentDeferred.reject(new Error("My consent error."));
    return expectAsync(commandPromise)
      .toBeResolvedTo({ url: "myurl" })
      .then(() => {
        expect(logger.warn).toHaveBeenCalledWith(
          "Unable to append identity to url. My consent error.",
        );
        expect(getIdentity).not.toHaveBeenCalled();
        expect(appendIdentityToUrl).not.toHaveBeenCalled();
      });
  });

  it("appendIdentityToUrl should return the unmodified url when getIdentity returns an error.", () => {
    const commandPromise = component.commands.appendIdentityToUrl.run({
      url: "myurl",
    });
    withConsentDeferred.resolve();
    getIdentityDeferred.reject(new Error("My getIdentity error."));
    return expectAsync(commandPromise)
      .toBeResolvedTo({ url: "myurl" })
      .then(() => {
        expect(logger.warn).toHaveBeenCalledOnceWith(
          "Unable to append identity to url. My getIdentity error.",
        );
        expect(appendIdentityToUrl).not.toHaveBeenCalled();
      });
  });

  it("appendIdentityToUrl should getIdentity when there isn't one.", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.and.returnValue(idSyncsPromise);
    appendIdentityToUrl.and.returnValue("modifiedUrl");
    const onResolved = jasmine.createSpy("onResolved");
    response.getEdge.and.returnValue({ regionId: 42 });
    component.commands.appendIdentityToUrl
      .run({ namespaces: ["ECID"], url: "myurl" })
      .then(onResolved);

    return flushPromiseChains()
      .then(() => {
        expect(getIdentity).not.toHaveBeenCalled();
        expect(onResolved).not.toHaveBeenCalled();
        withConsentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(getIdentity).toHaveBeenCalledWith(
          jasmine.objectContaining({ namespaces: ["ECID"] }),
        );
        getNamespacesFromResponse.and.returnValue({ ECID: "user@adobe" });
        component.lifecycle.onResponse({ response });
        getIdentityDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(logger.warn).not.toHaveBeenCalled();
        expect(appendIdentityToUrl).toHaveBeenCalledOnceWith(
          "user@adobe",
          "myurl",
        );
      });
  });

  it("appendIdentityToUrl should append the identity to a url when there is already an identity", () => {
    // set the ECID
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.and.returnValue(idSyncsPromise);
    getNamespacesFromResponse.and.returnValue({ ECID: "user@adobe" });
    response.getEdge.and.returnValue({ regionId: 7 });
    component.lifecycle.onResponse({ response });

    appendIdentityToUrl.and.returnValue("modifiedUrl");
    const commandPromise = component.commands.appendIdentityToUrl.run({
      url: "myurl",
    });
    withConsentDeferred.resolve();

    return expectAsync(commandPromise).toBeResolvedTo({ url: "modifiedUrl" });
  });

  it("appendIdentityToUrl should call getIdentity with configuration overrides, if provided", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.and.returnValue(idSyncsPromise);
    appendIdentityToUrl.and.returnValue("modifiedUrl");
    const onResolved = jasmine.createSpy("onResolved");
    response.getEdge.and.returnValue({ regionId: 42 });
    const edgeConfigOverrides = {
      com_adobe_identity: {
        idSyncContainerId: "123",
      },
    };
    component.commands.appendIdentityToUrl
      .run({ namespaces: ["ECID"], url: "myurl", edgeConfigOverrides })
      .then(onResolved);

    return flushPromiseChains()
      .then(() => {
        expect(getIdentity).not.toHaveBeenCalled();
        expect(onResolved).not.toHaveBeenCalled();
        withConsentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(getIdentity).toHaveBeenCalledWith(
          jasmine.objectContaining({
            namespaces: ["ECID"],
            edgeConfigOverrides,
          }),
        );
        getNamespacesFromResponse.and.returnValue({ ECID: "user@adobe" });
        component.lifecycle.onResponse({ response });
        getIdentityDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(logger.warn).not.toHaveBeenCalled();
        expect(appendIdentityToUrl).toHaveBeenCalledOnceWith(
          "user@adobe",
          "myurl",
        );
      });
  });
});
