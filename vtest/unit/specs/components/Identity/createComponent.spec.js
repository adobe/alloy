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

import { vi, beforeEach, describe, it, expect } from "vitest";
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
    ensureSingleIdentity = vi.fn();
    addEcidQueryToPayload = vi.fn();
    addQueryStringIdentityToPayload = vi.fn();
    setLegacyEcid = vi.fn();
    handleResponseForIdSyncs = vi.fn();
    getNamespacesFromResponse = vi.fn();
    getIdentityDeferred = defer();
    awaitConsentDeferred = defer();
    withConsentDeferred = defer();
    consent = {
      awaitConsent: vi.fn().mockReturnValue(awaitConsentDeferred.promise),
      withConsent: vi.fn().mockReturnValue(withConsentDeferred.promise),
    };
    appendIdentityToUrl = vi.fn();
    logger = {
      warn: vi.fn(),
    };
    getIdentity = vi.fn().mockReturnValue(getIdentityDeferred.promise);
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
    response = {
      getEdge: vi.fn(),
    };
  });
  it("adds ECID query to event", () => {
    const payload = {
      type: "payload",
    };
    const request = {
      getPayload() {
        return payload;
      },
    };
    const onResponse = vi.fn();
    component.lifecycle.onBeforeRequest({
      request,
      onResponse,
    });
    expect(addEcidQueryToPayload).toHaveBeenCalledWith(payload);
  });
  it("adds the query string identity to the payload", () => {
    const payload = {
      type: "payload",
    };
    const request = {
      getPayload() {
        return payload;
      },
    };
    component.lifecycle.onBeforeRequest({
      request,
    });
    expect(addQueryStringIdentityToPayload).toHaveBeenNthCalledWith(1, payload);
  });
  it("ensures request has identity", () => {
    const payload = {
      type: "payload",
    };
    const request = {
      getPayload() {
        return payload;
      },
    };
    const onResponse = vi.fn();
    const onRequestFailure = vi.fn();
    const ensureSingleIdentityPromise = Promise.resolve();
    ensureSingleIdentity.mockReturnValue(ensureSingleIdentityPromise);
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
    handleResponseForIdSyncs.mockReturnValue(idSyncsPromise);
    component.lifecycle.onResponse({
      response,
    });
    expect(getNamespacesFromResponse).toHaveBeenCalledWith(response);
    expect(setLegacyEcid).not.toHaveBeenCalled();
  });
  it("creates legacy identity cookie if response contains ECID", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.mockReturnValue(idSyncsPromise);
    getNamespacesFromResponse.mockReturnValue({
      ECID: "user@adobe",
    });
    component.lifecycle.onResponse({
      response,
    });
    expect(getNamespacesFromResponse).toHaveBeenCalledWith(response);
    expect(setLegacyEcid).toHaveBeenCalledWith("user@adobe");
    component.lifecycle.onResponse({
      response,
    });
    expect(getNamespacesFromResponse).toHaveBeenCalledTimes(2);
    expect(setLegacyEcid).toHaveBeenCalledTimes(1);
  });
  it("handles ID syncs", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.mockReturnValue(idSyncsPromise);
    const result = component.lifecycle.onResponse({
      response,
    });
    expect(handleResponseForIdSyncs).toHaveBeenCalledWith(response);
    return expect(result).resolves.toBe(undefined);
  });
  it("getIdentity command should make a request when ecid is not available", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.mockReturnValue(idSyncsPromise);
    const onResolved = vi.fn();
    const onResolved2 = vi.fn();
    response.getEdge.mockReturnValue({
      regionId: 42,
    });
    component.commands.getIdentity
      .run({
        namespaces: ["ECID"],
      })
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
        getNamespacesFromResponse.mockReturnValue({
          ECID: "user@adobe",
          CORE: "mycoreid",
        });
        component.lifecycle.onResponse({
          response,
        });
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
        getNamespacesFromResponse.mockReturnValue({
          CORE: "mycoreid",
        });
        component.commands.getIdentity
          .run({
            namespaces: ["CORE"],
          })
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
    handleResponseForIdSyncs.mockReturnValue(idSyncsPromise);
    getNamespacesFromResponse.mockReturnValue({
      ECID: "user@adobe",
    });
    response.getEdge.mockReturnValue({
      regionId: 7,
    });
    component.lifecycle.onResponse({
      response,
    });
    const onResolved = vi.fn();
    component.commands.getIdentity
      .run({
        namespaces: ["ECID"],
      })
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
    handleResponseForIdSyncs.mockReturnValue(idSyncsPromise);
    getNamespacesFromResponse.mockReturnValue({
      ECID: "user@adobe",
      CORE: "mycoreid",
    });
    response.getEdge.mockReturnValue({
      regionId: 7,
    });
    component.lifecycle.onResponse({
      response,
    });
    const onResolved = vi.fn();
    component.commands.getIdentity
      .run({
        namespaces: ["CORE"],
      })
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
    handleResponseForIdSyncs.mockReturnValue(idSyncsPromise);
    const onResolved = vi.fn();
    response.getEdge.mockReturnValue({
      regionId: 42,
    });
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
        getNamespacesFromResponse.mockReturnValue({
          ECID: "user@adobe",
        });
        component.lifecycle.onResponse({
          response,
        });
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
    return expect(commandPromise)
      .resolves.toStrictEqual({
        url: "myurl",
      })
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
    return expect(commandPromise)
      .resolves.toStrictEqual({
        url: "myurl",
      })
      .then(() => {
        expect(logger.warn).toHaveBeenNthCalledWith(
          1,
          "Unable to append identity to url. My getIdentity error.",
        );
        expect(appendIdentityToUrl).not.toHaveBeenCalled();
      });
  });
  it("appendIdentityToUrl should getIdentity when there isn't one.", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.mockReturnValue(idSyncsPromise);
    appendIdentityToUrl.mockReturnValue("modifiedUrl");
    const onResolved = vi.fn();
    response.getEdge.mockReturnValue({
      regionId: 42,
    });
    component.commands.appendIdentityToUrl
      .run({
        namespaces: ["ECID"],
        url: "myurl",
      })
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
          expect.objectContaining({
            namespaces: ["ECID"],
          }),
        );
        getNamespacesFromResponse.mockReturnValue({
          ECID: "user@adobe",
        });
        component.lifecycle.onResponse({
          response,
        });
        getIdentityDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(logger.warn).not.toHaveBeenCalled();
        expect(appendIdentityToUrl).toHaveBeenNthCalledWith(
          1,
          "user@adobe",
          "myurl",
        );
      });
  });
  it("appendIdentityToUrl should append the identity to a url when there is already an identity", () => {
    // set the ECID
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.mockReturnValue(idSyncsPromise);
    getNamespacesFromResponse.mockReturnValue({
      ECID: "user@adobe",
    });
    response.getEdge.mockReturnValue({
      regionId: 7,
    });
    component.lifecycle.onResponse({
      response,
    });
    appendIdentityToUrl.mockReturnValue("modifiedUrl");
    const commandPromise = component.commands.appendIdentityToUrl.run({
      url: "myurl",
    });
    withConsentDeferred.resolve();
    return expect(commandPromise).resolves.toStrictEqual({
      url: "modifiedUrl",
    });
  });
  it("appendIdentityToUrl should call getIdentity with configuration overrides, if provided", () => {
    const idSyncsPromise = Promise.resolve();
    handleResponseForIdSyncs.mockReturnValue(idSyncsPromise);
    appendIdentityToUrl.mockReturnValue("modifiedUrl");
    const onResolved = vi.fn();
    response.getEdge.mockReturnValue({
      regionId: 42,
    });
    const edgeConfigOverrides = {
      com_adobe_identity: {
        idSyncContainerId: "123",
      },
    };
    component.commands.appendIdentityToUrl
      .run({
        namespaces: ["ECID"],
        url: "myurl",
        edgeConfigOverrides,
      })
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
          expect.objectContaining({
            namespaces: ["ECID"],
            edgeConfigOverrides,
          }),
        );
        getNamespacesFromResponse.mockReturnValue({
          ECID: "user@adobe",
        });
        component.lifecycle.onResponse({
          response,
        });
        getIdentityDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(logger.warn).not.toHaveBeenCalled();
        expect(appendIdentityToUrl).toHaveBeenNthCalledWith(
          1,
          "user@adobe",
          "myurl",
        );
      });
  });
});
