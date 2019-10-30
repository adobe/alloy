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
import { defer } from "../../../../src/utils";
import flushPromiseChains from "../../helpers/flushPromiseChains";

describe("createEventManager", () => {
  let event;
  let payload;
  let lifecycle;
  let network;
  let optIn;
  let config;
  let eventManager;
  let logger;
  beforeEach(() => {
    event = {
      mergeXdm() {},
      isDocumentUnloading: () => false,
      toJSON() {
        return { xdm: {} };
      },
      applyCallback: jasmine.createSpy()
    };
    const createEvent = jasmine.createSpy().and.returnValue(event);
    lifecycle = {
      onBeforeEvent: jasmine.createSpy().and.returnValue(Promise.resolve()),
      onBeforeDataCollection: jasmine
        .createSpy()
        .and.returnValue(Promise.resolve())
    };
    payload = {
      addEvent: jasmine.createSpy(),
      mergeMeta: jasmine.createSpy(),
      expectsResponse: false,
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
    config = {
      imsOrgId: "ABC123",
      onBeforeEventSend: jasmine.createSpy()
    };
    logger = {
      warn: jasmine.createSpy()
    };
    eventManager = createEventManager({
      createEvent,
      optIn,
      lifecycle,
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
            imsOrgId: "ABC123"
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

    it("applies user provided data", () => {
      const options = {
        applyUserProvidedData: jasmine.createSpy()
      };
      return eventManager.sendEvent(event, options).then(() => {
        expect(options.applyUserProvidedData).toHaveBeenCalledWith(event);
      });
    });

    it("calls the onBeforeEventSend callback", () => {
      return eventManager.sendEvent(event, {}).then(() => {
        expect(event.applyCallback).toHaveBeenCalledWith(config.onBeforeEventSend);
      });
    });

    it("handles errors in the onBeforeEventSend callback", () => {
      const error = Error("onBeforeEventSend error");
      event.applyCallback.and.throwError(error);
      return eventManager.sendEvent(event, {}).then(() => {
        expect(logger.warn).toHaveBeenCalledWith(error);
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

    it("send payload through network", () => {
      return eventManager.sendEvent(event).then(() => {
        expect(network.sendRequest).toHaveBeenCalledWith(payload, {
          expectsResponse: false,
          documentUnloading: false
        });
      });
    });

    it("sends payload through network with expectsResponse true", () => {
      payload.expectsResponse = true;
      return eventManager.sendEvent(event).then(() => {
        expect(network.sendRequest).toHaveBeenCalledWith(payload, {
          expectsResponse: true,
          documentUnloading: false
        });
      });
    });

    it("sends payload through network with documentUnloading true", () => {
      event.isDocumentUnloading = () => true;
      return eventManager.sendEvent(event).then(() => {
        expect(network.sendRequest).toHaveBeenCalledWith(payload, {
          expectsResponse: false,
          documentUnloading: true
        });
      });
    });

    it("returns request and response info", () => {
      const response = { type: "response" };
      network.sendRequest.and.returnValue(Promise.resolve(response));
      return eventManager.sendEvent(event).then(result => {
        expect(result.requestBody).toEqual(payload.toJSON());
        expect(result.requestBody).not.toBe(payload);
        expect(result.responseBody).toEqual(response);
        expect(result.requestBody).not.toBe(response);
      });
    });

    it("returns request info but not response info if no response provided", () => {
      return eventManager.sendEvent(event).then(result => {
        expect(result.requestBody).toEqual(payload.toJSON());
        expect(result.requestBody).not.toBe(payload);
        expect(result.responseBody).toBeUndefined();
      });
    });

    it("performs operations in order", () => {
      return eventManager.sendEvent(event).then(() => {
        expect(lifecycle.onBeforeEvent).toHaveBeenCalledBefore(
          optIn.whenOptedIn
        );
        expect(optIn.whenOptedIn).toHaveBeenCalledBefore(
          lifecycle.onBeforeDataCollection
        );
        expect(lifecycle.onBeforeDataCollection).toHaveBeenCalledBefore(
          network.sendRequest
        );
      });
    });
  });
});
