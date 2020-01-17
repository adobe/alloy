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
import realCreateDataCollectionRequestPayload from "../../../../src/core/edgeNetwork/requestPayloads/createDataCollectionRequestPayload";
import realCreateEvent from "../../../../src/core/createEvent";
import createConfig from "../../../../src/core/config/createConfig";
import { defer } from "../../../../src/utils";
import flushPromiseChains from "../../helpers/flushPromiseChains";

describe("createEventManager", () => {
  let config;
  let logger;
  let lifecycle;
  let consent;
  let event;
  let requestPayload;
  let sendEdgeNetworkRequest;
  let eventManager;
  beforeEach(() => {
    config = createConfig({
      orgId: "ABC123",
      onBeforeEventSend: jasmine.createSpy(),
      debugEnabled: true,
      datasetId: "DATASETID",
      schemaId: "SCHEMAID"
    });
    logger = jasmine.createSpyObj("logger", ["error", "warn"]);
    lifecycle = jasmine.createSpyObj("lifecycle", {
      onBeforeEvent: Promise.resolve(),
      onBeforeDataCollectionRequest: Promise.resolve()
    });
    consent = jasmine.createSpyObj("consent", {
      whenConsented: Promise.resolve()
    });
    event = realCreateEvent();
    spyOnAllFunctions(event);
    const createEvent = () => {
      return event;
    };
    requestPayload = realCreateDataCollectionRequestPayload();
    spyOnAllFunctions(requestPayload);
    const createDataCollectionRequestPayload = () => {
      return requestPayload;
    };
    sendEdgeNetworkRequest = jasmine
      .createSpy("sendEdgeNetworkRequest")
      .and.returnValue(Promise.resolve());
    eventManager = createEventManager({
      config,
      logger,
      lifecycle,
      consent,
      createEvent,
      createDataCollectionRequestPayload,
      sendEdgeNetworkRequest
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
        expect(requestPayload.mergeConfigOverrides).toHaveBeenCalledWith({
          orgId: "ABC123",
          dataCollection: {
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
            isViewStart: true,
            scopes: undefined,
            payload: requestPayload
          });
          expect(consent.whenConsented).not.toHaveBeenCalled();
          deferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(sendEdgeNetworkRequest).toHaveBeenCalled();
        });
    });

    it("sets the lastChanceCallback, which wraps config.onBeforeEventSend, on the event", () => {
      let wrappedLastChanceCallback;
      event.setLastChanceCallback.and.callFake(callback => {
        wrappedLastChanceCallback = callback;
      });
      return eventManager.sendEvent(event, {}).then(() => {
        wrappedLastChanceCallback();
        expect(config.onBeforeEventSend).toHaveBeenCalled();
      });
    });

    it("logs errors in the config.onBeforeEventSend callback", () => {
      const error = new Error("onBeforeEventSend error");
      config.onBeforeEventSend.and.throwError(error);

      let wrappedLastChanceCallback;
      event.setLastChanceCallback.and.callFake(callback => {
        wrappedLastChanceCallback = callback;
      });

      return eventManager.sendEvent(event, {}).then(() => {
        expect(() => {
          wrappedLastChanceCallback();
        }).toThrowError("onBeforeEventSend error");
        expect(logger.error).toHaveBeenCalledWith(error);
      });
    });

    it("calls onBeforeEvent before consent and onBeforeDataCollectionRequest after", () => {
      const deferred = defer();
      consent.whenConsented = () => deferred.promise;
      eventManager.sendEvent(event);
      return flushPromiseChains()
        .then(() => {
          expect(lifecycle.onBeforeEvent).toHaveBeenCalled();
          expect(
            lifecycle.onBeforeDataCollectionRequest
          ).not.toHaveBeenCalled();
          deferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(lifecycle.onBeforeDataCollectionRequest).toHaveBeenCalled();
        });
    });

    it("allows other components to access payload and pause the lifecycle", () => {
      const deferred = defer();
      lifecycle.onBeforeDataCollectionRequest.and.returnValue(deferred.promise);
      eventManager.sendEvent(event);
      return flushPromiseChains()
        .then(() => {
          expect(lifecycle.onBeforeDataCollectionRequest).toHaveBeenCalled();
          expect(sendEdgeNetworkRequest).not.toHaveBeenCalled();
          deferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(sendEdgeNetworkRequest).toHaveBeenCalled();
        });
    });

    it("sends request using interact endpoint if a response is expected and the document won't unload", () => {
      requestPayload.getExpectResponse.and.returnValue(true);
      event.getDocumentMayUnload.and.returnValue(false);
      return eventManager.sendEvent(event).then(() => {
        expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
          payload: requestPayload,
          action: "interact"
        });
      });
    });

    it("sends request using collect endpoint if a response is not expected and the document won't unload", () => {
      requestPayload.getExpectResponse.and.returnValue(false);
      event.getDocumentMayUnload.and.returnValue(false);
      return eventManager.sendEvent(event).then(() => {
        expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
          payload: requestPayload,
          action: "collect"
        });
      });
    });

    it("sends request using collect endpoint if a response is expected and the document may unload", () => {
      requestPayload.getExpectResponse.and.returnValue(true);
      event.getDocumentMayUnload.and.returnValue(true);
      return eventManager.sendEvent(event).then(() => {
        expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
          payload: requestPayload,
          action: "collect"
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
});
