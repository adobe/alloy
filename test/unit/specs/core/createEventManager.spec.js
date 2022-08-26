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

const CANCELLATION_MESSAGE_REGEX = /Event was canceled/;

describe("createEventManager", () => {
  let config;
  let logger;
  let lifecycle;
  let consent;
  let event;
  let requestPayload;
  let request;
  let sendEdgeNetworkRequest;
  let applyResponse;
  let onRequestFailureForOnBeforeEvent;
  let fakeOnRequestFailure;
  let eventManager;
  beforeEach(() => {
    config = createConfig({
      orgId: "ABC123",
      onBeforeEventSend: jasmine.createSpy(),
      debugEnabled: true
    });
    logger = jasmine.createSpyObj("logger", ["info"]);
    lifecycle = jasmine.createSpyObj("lifecycle", {
      onBeforeEvent: Promise.resolve(),
      onBeforeDataCollectionRequest: Promise.resolve(),
      onRequestFailure: Promise.resolve()
    });
    consent = jasmine.createSpyObj("consent", {
      awaitConsent: Promise.resolve()
    });
    event = jasmine.createSpyObj("event", {
      finalize: undefined,
      shouldSend: true
    });
    onRequestFailureForOnBeforeEvent = jasmine.createSpy(
      "onRequestFailureForOnBeforeEvent"
    );
    fakeOnRequestFailure = ({ onRequestFailure }) => {
      onRequestFailure(onRequestFailureForOnBeforeEvent);
      return Promise.resolve();
    };
    const createEvent = () => {
      return event;
    };
    requestPayload = jasmine.createSpyObj("requestPayload", [
      "addEvent",
      "mergeConfigOverride"
    ]);
    const createDataCollectionRequestPayload = () => {
      return requestPayload;
    };
    request = {
      getPayload() {
        return requestPayload;
      }
    };
    const createDataCollectionRequest = () => {
      return request;
    };
    sendEdgeNetworkRequest = jasmine
      .createSpy("sendEdgeNetworkRequest")
      .and.returnValue(Promise.resolve());
    applyResponse = jasmine
      .createSpy("applyResponse")
      .and.returnValue(Promise.resolve());
    eventManager = createEventManager({
      config,
      logger,
      lifecycle,
      consent,
      createEvent,
      createDataCollectionRequestPayload,
      createDataCollectionRequest,
      sendEdgeNetworkRequest,
      applyResponse
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
        expect(requestPayload.addEvent).toHaveBeenCalledWith(event);
      });
    });

    it("allows other components to access event and pause the lifecycle", () => {
      const deferred = defer();
      const options = {
        renderDecisions: true
      };
      lifecycle.onBeforeEvent.and.returnValue(deferred.promise);
      eventManager.sendEvent(event, options);
      return flushPromiseChains()
        .then(() => {
          expect(lifecycle.onBeforeEvent).toHaveBeenCalledWith({
            event,
            renderDecisions: true,
            decisionScopes: undefined,
            onResponse: jasmine.any(Function),
            onRequestFailure: jasmine.any(Function)
          });
          expect(consent.awaitConsent).not.toHaveBeenCalled();
          deferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(sendEdgeNetworkRequest).toHaveBeenCalled();
        });
    });

    it("events call finalize with onBeforeEventSend callback", () => {
      return eventManager.sendEvent(event).then(() => {
        expect(event.finalize).toHaveBeenCalledWith(config.onBeforeEventSend);
      });
    });

    it("does not send event when event.shouldSend returns false", () => {
      lifecycle.onBeforeEvent.and.callFake(fakeOnRequestFailure);
      event.shouldSend.and.returnValue(false);
      return eventManager.sendEvent(event).then(result => {
        expect(result).toBeUndefined();
        expect(onRequestFailureForOnBeforeEvent).toHaveBeenCalled();
        expect(
          onRequestFailureForOnBeforeEvent.calls.mostRecent().args[0].error
            .message
        ).toMatch(CANCELLATION_MESSAGE_REGEX);
        expect(logger.info).toHaveBeenCalledWith(
          jasmine.stringMatching(CANCELLATION_MESSAGE_REGEX)
        );
        expect(sendEdgeNetworkRequest).not.toHaveBeenCalled();
      });
    });

    it("sends event when event.shouldSend returns true", () => {
      lifecycle.onBeforeEvent.and.callFake(fakeOnRequestFailure);
      return eventManager.sendEvent(event).then(result => {
        expect(result).toBeUndefined();
        expect(onRequestFailureForOnBeforeEvent).not.toHaveBeenCalled();
        expect(sendEdgeNetworkRequest).toHaveBeenCalled();
      });
    });

    it("throws an error on event finalize and event should not be sent", () => {
      lifecycle.onBeforeEvent.and.callFake(fakeOnRequestFailure);
      const errorMsg = "Expected Error";
      event.finalize.and.throwError(errorMsg);
      return eventManager
        .sendEvent(event)
        .then(() => {
          throw new Error("Should not have resolved.");
        })
        .catch(error => {
          expect(error.message).toEqual(errorMsg);
          expect(onRequestFailureForOnBeforeEvent).toHaveBeenCalledWith({
            error
          });
          expect(sendEdgeNetworkRequest).not.toHaveBeenCalled();
        });
    });

    it("allows components and consent to pause the lifecycle", () => {
      const onBeforeEventDeferred = defer();
      const consentDeferred = defer();
      lifecycle.onBeforeEvent.and.returnValue(onBeforeEventDeferred.promise);
      consent.awaitConsent.and.returnValue(consentDeferred.promise);
      eventManager.sendEvent(event);
      expect(lifecycle.onBeforeEvent).toHaveBeenCalled();
      return flushPromiseChains()
        .then(() => {
          expect(consent.awaitConsent).not.toHaveBeenCalled();
          expect(sendEdgeNetworkRequest).not.toHaveBeenCalled();
          onBeforeEventDeferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(consent.awaitConsent).toHaveBeenCalled();
          expect(sendEdgeNetworkRequest).not.toHaveBeenCalled();
          consentDeferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(sendEdgeNetworkRequest).toHaveBeenCalled();
        });
    });

    it("calls onResponse callbacks on response", () => {
      const onResponseForOnBeforeEvent = jasmine.createSpy(
        "onResponseForOnBeforeEvent"
      );
      lifecycle.onBeforeEvent.and.callFake(({ onResponse }) => {
        onResponse(onResponseForOnBeforeEvent);
        return Promise.resolve();
      });
      const response = { type: "response" };
      sendEdgeNetworkRequest.and.callFake(({ runOnResponseCallbacks }) => {
        runOnResponseCallbacks({ response });
        return Promise.resolve();
      });
      return eventManager.sendEvent(event).then(() => {
        expect(onResponseForOnBeforeEvent).toHaveBeenCalledWith({ response });
      });
    });

    it("calls onRequestFailure callbacks on request failure", () => {
      lifecycle.onBeforeEvent.and.callFake(fakeOnRequestFailure);
      sendEdgeNetworkRequest.and.callFake(
        ({ runOnRequestFailureCallbacks }) => {
          const error = new Error();
          runOnRequestFailureCallbacks({ error });
          throw error;
        }
      );
      return eventManager
        .sendEvent(event)
        .then(fail)
        .catch(error => {
          expect(onRequestFailureForOnBeforeEvent).toHaveBeenCalledWith({
            error
          });
        });
    });

    it("sends network request", () => {
      return eventManager.sendEvent(event).then(() => {
        expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
          request,
          runOnResponseCallbacks: jasmine.any(Function),
          runOnRequestFailureCallbacks: jasmine.any(Function)
        });
      });
    });

    it("fails returned promise if request fails", () => {
      sendEdgeNetworkRequest.and.returnValue(
        Promise.reject(new Error("no connection"))
      );
      return expectAsync(eventManager.sendEvent(event)).toBeRejectedWithError(
        "no connection"
      );
    });
  });

  describe("applyResponse", () => {
    const responseHeaders = {
      "x-request-id": "474ec8af-6326-4cb5-952a-4b7dc6be5749"
    };
    const responseBody = {
      requestId: "474ec8af-6326-4cb5-952a-4b7dc6be5749",
      handle: []
    };

    const options = {
      renderDecisions: false,
      responseHeaders,
      responseBody
    };

    it("creates the payload and adds event and meta", () => {
      return eventManager.applyResponse(event, options).then(() => {
        expect(requestPayload.addEvent).toHaveBeenCalledWith(event);
      });
    });

    it("events no not call finalize with onBeforeEventSend callback", () => {
      return eventManager.applyResponse(event, options).then(() => {
        expect(event.finalize).not.toHaveBeenCalled();
      });
    });

    it("calls onResponse callbacks", () => {
      const onResponseForOnBeforeEvent = jasmine.createSpy(
        "onResponseForOnBeforeEvent"
      );
      lifecycle.onBeforeEvent.and.callFake(({ onResponse }) => {
        onResponse(onResponseForOnBeforeEvent);
        return Promise.resolve();
      });
      const response = { type: "response" };

      applyResponse.and.callFake(({ runOnResponseCallbacks }) => {
        runOnResponseCallbacks({ response });
        return Promise.resolve();
      });

      return eventManager.applyResponse(event, options).then(() => {
        expect(onResponseForOnBeforeEvent).toHaveBeenCalledWith({ response });
      });
    });

    it("applies AEP edge response headers and body and returns result", () => {
      const mockResult = { response: "yep" };
      applyResponse.and.returnValue(mockResult);

      return eventManager.applyResponse(event, options).then(result => {
        expect(sendEdgeNetworkRequest).not.toHaveBeenCalled();
        expect(applyResponse).toHaveBeenCalledWith({
          request,
          responseHeaders,
          responseBody,
          runOnResponseCallbacks: jasmine.any(Function)
        });
        expect(result).toEqual(mockResult);
      });
    });

    it("includes override configuration, if provided", done => {
      eventManager
        .sendEvent(event, {
          configuration: {
            experience_platform: {
              event: "456",
              profile: ""
            },
            identity: {
              idSyncContainerId: "123"
            },
            target: {
              propertyToken: ""
            }
          }
        })
        .then(() => {
          expect(requestPayload.mergeConfigOverride).toHaveBeenCalledWith({
            com_adobe_identity: {
              idSyncContainerId: "123"
            },
            com_adobe_experience_platform: {
              event: "456"
            }
          });
          done();
        });
    });
  });
});
