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

import createEventManager from "../../../../src/core/createEventManager";
import createConfig from "../../../../src/core/config/createConfig";
import { defer } from "../../../../src/utils";
import flushPromiseChains from "../../helpers/flushPromiseChains";
import assertFunctionCallOrder from "../../helpers/assertFunctionCallOrder";
import {
  EDGE_DOMAIN,
  ID_THIRD_PARTY_DOMAIN
} from "../../../../src/constants/domains";

describe("createEventManager", () => {
  let event;
  let response;
  let payload;
  let lifecycle;
  let cookieTransfer;
  let network;
  let optIn;
  let config;
  let eventManager;
  let logger;
  let lastChanceCallback;
  beforeEach(() => {
    event = {
      mergeXdm() {},
      set lastChanceCallback(value) {
        lastChanceCallback = value;
      },
      isDocumentUnloading: false,
      applyCallback: jasmine.createSpy()
    };
    const createEvent = jasmine.createSpy().and.returnValue(event);
    response = {
      getErrors: jasmine.createSpy().and.returnValue([]),
      getWarnings: jasmine.createSpy().and.returnValue([])
    };
    const createResponse = () => response;
    lifecycle = {
      onBeforeEvent: jasmine.createSpy().and.returnValue(Promise.resolve()),
      onBeforeDataCollection: jasmine
        .createSpy()
        .and.returnValue(Promise.resolve()),
      onRequestFailure: jasmine.createSpy().and.returnValue(Promise.resolve()),
      onResponse: jasmine.createSpy().and.returnValue(Promise.resolve())
    };
    cookieTransfer = jasmine.createSpyObj("cookieTransfer", [
      "cookiesToPayload",
      "responseToCookies"
    ]);
    payload = {
      addEvent: jasmine.createSpy(),
      mergeMeta: jasmine.createSpy(),
      expectsResponse: false,
      shouldUseIdThirdPartyDomain: false,
      toJSON() {
        return { meta: {} };
      }
    };
    network = {
      createPayload: () => payload,
      sendRequest: jasmine.createSpy().and.returnValue(Promise.resolve())
    };
    optIn = {
      whenOptedIn: jasmine.createSpy().and.returnValue(Promise.resolve())
    };
    config = createConfig({
      edgeDomain: EDGE_DOMAIN,
      orgId: "ABC123",
      onBeforeEventSend: jasmine.createSpy(),
      debugEnabled: true,
      datasetId: "DATASETID",
      schemaId: "SCHEMAID"
    });
    logger = jasmine.createSpyObj("logger", ["error", "warn"]);
    eventManager = createEventManager({
      createEvent,
      createResponse,
      optIn,
      lifecycle,
      cookieTransfer,
      network,
      config,
      logger
    });
  });

  describe("createEvent", () => {
    it("creates an event object", () => {
      expect(eventManager.createEvent()).toBe(event);
    });
  });

  describe("sendEvent", () => {
    it("creates the payload and adds event and meta", () => {
      return eventManager.sendEvent(event).then(() => {
        expect(payload.addEvent).toHaveBeenCalledWith(event);
        expect(payload.mergeMeta).toHaveBeenCalledWith({
          gateway: {
            orgId: "ABC123"
          },
          collect: {
            synchronousValidation: true,
            datasetId: "DATASETID",
            schemaId: "SCHEMAID"
          }
        });
      });
    });

    it("allows other components to access event and pause the lifecycle", () => {
      const deferred = defer();
      const options = {
        isViewStart: true
      };
      lifecycle.onBeforeEvent.and.returnValue(deferred.promise);
      eventManager.sendEvent(event, options);
      return flushPromiseChains()
        .then(() => {
          expect(lifecycle.onBeforeEvent).toHaveBeenCalledWith({
            event,
            isViewStart: true
          });
          expect(optIn.whenOptedIn).not.toHaveBeenCalled();
          deferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(network.sendRequest).toHaveBeenCalled();
        });
    });

    it("sets the onBeforeEventSend callback", () => {
      const params = { xdm: { a: "1" }, data: { b: "2" } };
      payload.addEvent.and.callFake(() => {
        lastChanceCallback(params);
      });
      return eventManager.sendEvent(event, {}).then(() => {
        expect(config.onBeforeEventSend).toHaveBeenCalledWith(params);
      });
    });

    it("logs errors in the onBeforeEventSend callback", () => {
      const error = Error("onBeforeEventSend error");
      payload.addEvent.and.callFake(() => {
        try {
          lastChanceCallback({ xdm: {}, data: {} });
        } catch (e) {
          // noop
        }
      });
      config.onBeforeEventSend.and.throwError(error);
      return eventManager.sendEvent(event, {}).then(() => {
        expect(logger.error).toHaveBeenCalledWith(error);
      });
    });

    it("calls onBeforeEvent before consent and onBeforeDataCollection after", () => {
      const deferred = defer();
      optIn.whenOptedIn = () => deferred.promise;
      eventManager.sendEvent(event);
      return flushPromiseChains()
        .then(() => {
          expect(lifecycle.onBeforeEvent).toHaveBeenCalled();
          expect(lifecycle.onBeforeDataCollection).not.toHaveBeenCalled();
          deferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(lifecycle.onBeforeDataCollection).toHaveBeenCalled();
        });
    });

    it("allows other components to access payload and pause the lifecycle", () => {
      const deferred = defer();
      lifecycle.onBeforeDataCollection.and.returnValue(deferred.promise);
      eventManager.sendEvent(event);
      return flushPromiseChains()
        .then(() => {
          expect(lifecycle.onBeforeDataCollection).toHaveBeenCalled();
          expect(network.sendRequest).not.toHaveBeenCalled();
          deferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(network.sendRequest).toHaveBeenCalled();
        });
    });

    it("transfers cookies to payload using edge domain", () => {
      return eventManager.sendEvent(event).then(() => {
        expect(cookieTransfer.cookiesToPayload).toHaveBeenCalledWith(
          payload,
          EDGE_DOMAIN
        );
      });
    });

    it("transfers cookies to payload using ID third-party domain", () => {
      payload.shouldUseIdThirdPartyDomain = () => true;
      return eventManager.sendEvent(event).then(() => {
        expect(cookieTransfer.cookiesToPayload).toHaveBeenCalledWith(
          payload,
          ID_THIRD_PARTY_DOMAIN
        );
      });
    });

    it("send payload through network using edge domain", () => {
      return eventManager.sendEvent(event).then(() => {
        expect(network.sendRequest).toHaveBeenCalledWith(payload, EDGE_DOMAIN, {
          expectsResponse: false,
          documentUnloading: false
        });
      });
    });

    it("send payload through network using ID third-party domain", () => {
      payload.shouldUseIdThirdPartyDomain = () => true;
      return eventManager.sendEvent(event).then(() => {
        expect(network.sendRequest).toHaveBeenCalledWith(
          payload,
          ID_THIRD_PARTY_DOMAIN,
          {
            expectsResponse: false,
            documentUnloading: false
          }
        );
      });
    });

    it("sends payload through network with expectsResponse true", () => {
      payload.expectsResponse = true;
      return eventManager.sendEvent(event).then(() => {
        expect(network.sendRequest).toHaveBeenCalledWith(payload, EDGE_DOMAIN, {
          expectsResponse: true,
          documentUnloading: false
        });
      });
    });

    it("sends payload through network with documentUnloading true", () => {
      event.isDocumentUnloading = true;
      return eventManager.sendEvent(event).then(() => {
        expect(network.sendRequest).toHaveBeenCalledWith(payload, EDGE_DOMAIN, {
          expectsResponse: false,
          documentUnloading: true
        });
      });
    });

    it("transfers response to cookies", () => {
      return eventManager.sendEvent(event).then(() => {
        expect(cookieTransfer.responseToCookies).toHaveBeenCalledWith(response);
      });
    });

    it("calls lifecycle.onRequestFailure, allows components to pause lifecycle, and rejects promise on request failure", () => {
      const deferred = defer();
      const error = new Error("Unexpected response.");
      network.sendRequest.and.throwError(error);
      lifecycle.onRequestFailure.and.returnValue(deferred.promise);
      const onError = jasmine.createSpy();
      eventManager
        .sendEvent(event)
        .then(fail)
        .catch(onError);

      return flushPromiseChains()
        .then(() => {
          expect(lifecycle.onRequestFailure).toHaveBeenCalled();
          expect(onError).not.toHaveBeenCalled();
          deferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(onError).toHaveBeenCalledWith(error);
        });
    });

    it("calls lifecycle.onResponse and allows components to pause lifecycle on request success", () => {
      const deferred = defer();
      network.sendRequest.and.returnValue(Promise.resolve({}));
      lifecycle.onResponse.and.returnValue(deferred.promise);
      const onComplete = jasmine.createSpy();
      eventManager.sendEvent(event).then(onComplete);
      return flushPromiseChains()
        .then(() => {
          expect(lifecycle.onResponse).toHaveBeenCalledWith({
            response
          });
          expect(onComplete).not.toHaveBeenCalled();
          deferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(onComplete).toHaveBeenCalled();
        });
    });

    it("logs warnings on response", () => {
      response.getWarnings.and.returnValue([
        {
          code: "general:100",
          message: "General warning."
        },
        {
          code: "personalization:204",
          message: "Personalization warning."
        }
      ]);

      return eventManager.sendEvent(event).then(() => {
        expect(logger.warn).toHaveBeenCalledWith(
          "Warning received from server: [Code general:100] General warning."
        );
        expect(logger.warn).toHaveBeenCalledWith(
          "Warning received from server: [Code personalization:204] Personalization warning."
        );
      });
    });

    it("rejects returned promise with errors on response", () => {
      response.getErrors.and.returnValue([
        {
          code: "general:100",
          message: "General error occurred."
        },
        {
          code: "personalization:204",
          message: "Personalization error occurred."
        }
      ]);
      return eventManager
        .sendEvent(event)
        .then(fail)
        .catch(error => {
          expect(error.message).toEqual(
            "The server responded with the following errors:\n" +
              "• [Code general:100] General error occurred.\n" +
              "• [Code personalization:204] Personalization error occurred."
          );
        });
    });

    it("returns promise resolved with nothing when there is a response", () => {
      const responseBody = {
        warnings: [],
        errors: []
      };
      network.sendRequest.and.returnValue(Promise.resolve(responseBody));
      return eventManager.sendEvent(event).then(result => {
        expect(result).toBeUndefined();
      });
    });

    it("returns promise resolved with nothing when there is not a response", () => {
      network.sendRequest.and.returnValue(Promise.resolve());
      return eventManager.sendEvent(event).then(result => {
        expect(result).toBeUndefined();
      });
    });

    it("performs operations in order on successful request", () => {
      return eventManager.sendEvent(event).then(() => {
        assertFunctionCallOrder([
          lifecycle.onBeforeEvent,
          optIn.whenOptedIn,
          lifecycle.onBeforeDataCollection,
          cookieTransfer.cookiesToPayload,
          network.sendRequest,
          cookieTransfer.responseToCookies,
          lifecycle.onResponse
        ]);
      });
    });

    it("performs operations in order on failed request", () => {
      network.sendRequest.and.throwError(new Error("Unexpected response."));
      return eventManager
        .sendEvent(event)
        .then(fail)
        .catch(() => {
          assertFunctionCallOrder([
            lifecycle.onBeforeEvent,
            optIn.whenOptedIn,
            lifecycle.onBeforeDataCollection,
            cookieTransfer.cookiesToPayload,
            network.sendRequest,
            lifecycle.onRequestFailure
          ]);
        });
    });
  });
});
