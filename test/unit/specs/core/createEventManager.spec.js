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
import createEventManager from "../../../../src/core/createEventManager.js";
import createConfig from "../../../../src/core/config/createConfig.js";
import { defer } from "../../../../src/utils/index.js";
import flushPromiseChains from "../../helpers/flushPromiseChains.js";

const CANCELLATION_MESSAGE_REGEX = /Event was canceled/;
describe("createEventManager", () => {
  let config;
  let logger;
  let lifecycle;
  let consent;
  let event;
  let requestPayload;
  let request;
  let createDataCollectionRequest;
  let sendEdgeNetworkRequest;
  let applyResponse;
  let onRequestFailureForOnBeforeEvent;
  let fakeOnRequestFailure;
  let eventManager;
  beforeEach(() => {
    config = createConfig({
      orgId: "ABC123",
      onBeforeEventSend: vi.fn(),
      debugEnabled: true,
      edgeConfigOverrides: {},
    });
    logger = {
      info: vi.fn(),
    };
    lifecycle = {
      onBeforeEvent: vi.fn().mockReturnValue(Promise.resolve()),
      onBeforeDataCollectionRequest: vi.fn().mockReturnValue(Promise.resolve()),
      onRequestFailure: vi.fn().mockReturnValue(Promise.resolve()),
    };
    consent = {
      awaitConsent: vi.fn().mockReturnValue(Promise.resolve()),
    };
    event = {
      finalize: vi.fn().mockReturnValue(undefined),
      shouldSend: vi.fn().mockReturnValue(true),
    };
    onRequestFailureForOnBeforeEvent = vi.fn();
    fakeOnRequestFailure = ({ onRequestFailure }) => {
      onRequestFailure(onRequestFailureForOnBeforeEvent);
      return Promise.resolve();
    };
    const createEvent = () => {
      return event;
    };
    requestPayload = {
      addEvent: vi.fn(),
      mergeConfigOverride: vi.fn(),
    };
    const createDataCollectionRequestPayload = () => {
      return requestPayload;
    };
    request = {
      getPayload() {
        return requestPayload;
      },
    };
    createDataCollectionRequest = vi.fn().mockReturnValue(request);
    sendEdgeNetworkRequest = vi.fn().mockReturnValue(Promise.resolve());
    applyResponse = vi.fn().mockReturnValue(Promise.resolve());
    eventManager = createEventManager({
      config,
      logger,
      lifecycle,
      consent,
      createEvent,
      createDataCollectionRequestPayload,
      createDataCollectionRequest,
      sendEdgeNetworkRequest,
      applyResponse,
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
        renderDecisions: true,
      };
      lifecycle.onBeforeEvent.mockReturnValue(deferred.promise);
      eventManager.sendEvent(event, options);
      return flushPromiseChains()
        .then(() => {
          expect(lifecycle.onBeforeEvent).toHaveBeenCalledWith({
            event,
            renderDecisions: true,
            onResponse: expect.any(Function),
            onRequestFailure: expect.any(Function),
          });
          expect(consent.awaitConsent).not.toHaveBeenCalled();
          deferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(sendEdgeNetworkRequest).toHaveBeenCalled();
        });
    });
    it("events call finalize with onBeforeEventSend callback", async () => {
      await eventManager.sendEvent(event);
      expect(event.finalize).toHaveBeenCalledWith(config.onBeforeEventSend);
    });
    it("does not send event when event.shouldSend returns false", () => {
      lifecycle.onBeforeEvent.mockImplementation(fakeOnRequestFailure);
      event.shouldSend.mockReturnValue(false);
      return eventManager.sendEvent(event).then((result) => {
        expect(result).toBeUndefined();
        expect(onRequestFailureForOnBeforeEvent).toHaveBeenCalled();
        expect(
          onRequestFailureForOnBeforeEvent.mock.calls[0][0].error.message,
        ).toMatch(CANCELLATION_MESSAGE_REGEX);
        expect(logger.info).toHaveBeenCalledWith(
          expect.stringMatching(CANCELLATION_MESSAGE_REGEX),
        );
        expect(sendEdgeNetworkRequest).not.toHaveBeenCalled();
      });
    });
    it("sends event when event.shouldSend returns true", () => {
      lifecycle.onBeforeEvent.mockImplementation(fakeOnRequestFailure);
      return eventManager.sendEvent(event).then((result) => {
        expect(result).toBeUndefined();
        expect(onRequestFailureForOnBeforeEvent).not.toHaveBeenCalled();
        expect(sendEdgeNetworkRequest).toHaveBeenCalled();
      });
    });
    it("throws an error on event finalize and event should not be sent", async () => {
      lifecycle.onBeforeEvent.mockImplementation(fakeOnRequestFailure);
      const errorMsg = "Expected Error";
      const error = new Error(errorMsg);

      event.finalize.mockImplementation(() => {
        throw error;
      });

      await expect(
        eventManager.sendEvent(event).then(() => {
          throw new Error("Should not have resolved.");
        }),
      ).rejects.toThrowError(errorMsg);

      expect(onRequestFailureForOnBeforeEvent).toHaveBeenCalledWith({
        error,
      });

      expect(sendEdgeNetworkRequest).not.toHaveBeenCalled();
    });
    it("allows components and consent to pause the lifecycle", () => {
      const onBeforeEventDeferred = defer();
      const consentDeferred = defer();
      lifecycle.onBeforeEvent.mockReturnValue(onBeforeEventDeferred.promise);
      consent.awaitConsent.mockReturnValue(consentDeferred.promise);
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
    it("calls onResponse callbacks on response", async () => {
      const onResponseForOnBeforeEvent = vi.fn();
      lifecycle.onBeforeEvent.mockImplementation(({ onResponse }) => {
        onResponse(onResponseForOnBeforeEvent);
        return Promise.resolve();
      });
      const response = {
        type: "response",
      };
      sendEdgeNetworkRequest.mockImplementation(
        ({ runOnResponseCallbacks }) => {
          runOnResponseCallbacks({
            response,
          });
          return Promise.resolve();
        },
      );

      await eventManager.sendEvent(event);
      expect(onResponseForOnBeforeEvent).toHaveBeenCalledWith({
        response,
      });
    });
    it("calls onRequestFailure callbacks on request failure", async () => {
      lifecycle.onBeforeEvent.mockImplementation(fakeOnRequestFailure);
      const error = new Error();
      sendEdgeNetworkRequest.mockImplementation(
        ({ runOnRequestFailureCallbacks }) => {
          runOnRequestFailureCallbacks({ error });
          throw error;
        },
      );

      await expect(eventManager.sendEvent(event)).rejects.toThrow(error);
      expect(onRequestFailureForOnBeforeEvent).toHaveBeenCalledWith({ error });
    });
    it("sends network request", () => {
      return eventManager.sendEvent(event).then(() => {
        expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
          request,
          runOnResponseCallbacks: expect.any(Function),
          runOnRequestFailureCallbacks: expect.any(Function),
        });
      });
    });
    it("fails returned promise if request fails", () => {
      sendEdgeNetworkRequest.mockReturnValue(
        Promise.reject(new Error("no connection")),
      );
      return expect(eventManager.sendEvent(event)).rejects.toThrowError(
        "no connection",
      );
    });
  });
  describe("applyResponse", () => {
    const responseHeaders = {
      "x-request-id": "474ec8af-6326-4cb5-952a-4b7dc6be5749",
    };
    const responseBody = {
      requestId: "474ec8af-6326-4cb5-952a-4b7dc6be5749",
      handle: [],
    };
    const options = {
      renderDecisions: false,
      responseHeaders,
      responseBody,
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
      const onResponseForOnBeforeEvent = vi.fn();
      lifecycle.onBeforeEvent.mockImplementation(({ onResponse }) => {
        onResponse(onResponseForOnBeforeEvent);
        return Promise.resolve();
      });
      const response = {
        type: "response",
      };
      applyResponse.mockImplementation(({ runOnResponseCallbacks }) => {
        runOnResponseCallbacks({
          response,
        });
        return Promise.resolve();
      });
      return eventManager.applyResponse(event, options).then(() => {
        expect(onResponseForOnBeforeEvent).toHaveBeenCalledWith({
          response,
        });
      });
    });
    it("applies AEP edge response headers and body and returns result", () => {
      const mockResult = {
        response: "yep",
      };
      applyResponse.mockReturnValue(mockResult);
      return eventManager.applyResponse(event, options).then((result) => {
        expect(sendEdgeNetworkRequest).not.toHaveBeenCalled();
        expect(applyResponse).toHaveBeenCalledWith({
          request,
          responseHeaders,
          responseBody,
          runOnResponseCallbacks: expect.any(Function),
        });
        expect(result).toEqual(mockResult);
      });
    });
    it("includes override configuration, if provided", () => {
      eventManager
        .sendEvent(event, {
          edgeConfigOverrides: {
            com_adobe_experience_platform: {
              event: {
                datasetId: "456",
              },
            },
            com_adobe_identity: {
              idSyncContainerId: "123",
            },
          },
        })
        .then(() => {
          expect(requestPayload.mergeConfigOverride).toHaveBeenCalledWith({
            com_adobe_identity: {
              idSyncContainerId: "123",
            },
            com_adobe_experience_platform: {
              event: {
                datasetId: "456",
              },
            },
          });
        });
    });
    it("includes global override configuration, if provided", () => {
      config.edgeConfigOverrides.com_adobe_identity = {
        idSyncContainerId: "123",
      };
      eventManager
        .sendEvent(event, {
          edgeConfigOverrides: {},
        })
        .then(() => {
          expect(requestPayload.mergeConfigOverride).toHaveBeenCalledWith({
            com_adobe_identity: {
              idSyncContainerId: "123",
            },
          });
        });
    });
    it("includes the datastreamId override, if provided", () => {
      eventManager
        .sendEvent(event, {
          edgeConfigOverrides: {
            datastreamId: "456",
          },
        })
        .then(() => {
          expect(createDataCollectionRequest).toHaveBeenCalledWith({
            payload: expect.any(Object),
            datastreamIdOverride: "456",
          });
        });
    });
  });
});
