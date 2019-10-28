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

// eslint-disable-next-line no-unused-vars
import createEventManager from "../../../../src/core/createEventManager";
// import createPayload from "../../../../src/core/network/createPayload";
// import { defer } from "../../../../src/utils";
// import flushPromiseChains from "../../helpers/flushPromiseChains";

// const logger = {
//   log() {},
//   warn() {}
// };
const config = {
  imsOrgId: "ABC123",
  get() {}
};

describe("createEventManager", () => {
  let event;
  let payload;
  let lifecycle;
  let network;
  let optIn;
  // let onBeforeEventSpy;
  // let onBeforeDataCollectionSpy;
  // let sendRequestSpy;
  let eventManager;
  beforeEach(() => {
    event = { mergeXdm() {}, isDocumentUnloading: () => true };
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
      expectsResponse: true
    };
    network = {
      createPayload: () => payload,
      sendRequest: jasmine.createSpy().and.returnValue(Promise.resolve({}))
    };
    optIn = {
      whenOptedIn: () => Promise.resolve()
    };
    eventManager = createEventManager({
      createEvent,
      optIn,
      lifecycle,
      network,
      config
    });
  });

  describe("createEvent", () => {
    it("creates an event object", () => {
      expect(eventManager.createEvent()).toBe(event);
    });
  });

  describe("sendEvent", () => {
    it("calls onBeforeEvent", () => {
      const options = {
        isViewStart: true
      };
      return eventManager.sendEvent(event, options).then(() => {
        expect(lifecycle.onBeforeEvent).toHaveBeenCalledWith({
          event,
          isViewStart: true
        });
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

    it("calls onBeforeDataCollection", () => {
      return eventManager.sendEvent(event).then(() => {
        expect(lifecycle.onBeforeDataCollection).toHaveBeenCalledWith({
          payload
        });
      });
    });

    it("calls sendRequest", () => {
      return eventManager.sendEvent(event).then(() => {
        expect(network.sendRequest).toHaveBeenCalledWith(payload, true, true);
      });
    });

    // it("resolves with response information", () => {
    //
    // });
    //
    // it("Allows other components to modify the event", () => {
    //   onBeforeEventSpy.and.callFake(({ event }) => {
    //     event.mergeXdm({ a: "changed" });
    //     return Promise.resolve();
    //   });
    //   return eventCommand({ data: { a: 1 } }).then(() => {
    //     expect(
    //       network.sendRequest.calls
    //         .argsFor(0)[0]
    //         .toJSON()
    //         .events[0].toJSON().xdm
    //     ).toEqual({ a: "changed" });
    //   });
    // });
    //
    // it("Allows other components to hold up the event", () => {
    //   const deferred = defer();
    //   onBeforeEventSpy.and.returnValue(deferred.promise);
    //   eventCommand({});
    //   return flushPromiseChains()
    //     .then(() => {
    //       expect(onBeforeEventSpy).toHaveBeenCalled();
    //       expect(sendRequestSpy).not.toHaveBeenCalled();
    //       deferred.resolve();
    //       return flushPromiseChains();
    //     })
    //     .then(() => {
    //       expect(sendRequestSpy).toHaveBeenCalled();
    //     });
    // });
    //
    // it("Sends the event through to the Network Gateway", () => {
    //   return eventCommand({ data: { a: 1 } }).then(() => {
    //     expect(sendRequestSpy).toHaveBeenCalled();
    //   });
    // });
    //
    // it("Calls onBeforeDataCollection", () => {
    //   return eventCommand({}).then(() => {
    //     expect(onBeforeDataCollectionSpy).toHaveBeenCalled();
    //   });
    // });
    //
    // it("Waits for onBeforeDataCollection promises", () => {
    //   const deferred = defer();
    //   onBeforeDataCollectionSpy.and.returnValue(deferred.promise);
    //   eventCommand({});
    //   return flushPromiseChains()
    //     .then(() => {
    //       expect(onBeforeDataCollectionSpy).toHaveBeenCalled();
    //       expect(sendRequestSpy).not.toHaveBeenCalled();
    //       deferred.resolve();
    //       return flushPromiseChains();
    //     })
    //     .then(() => {
    //       expect(sendRequestSpy).toHaveBeenCalled();
    //     });
    // });
    //
    // it("Returns a promise resolved with the request and response", () => {
    //   sendRequestSpy.and.returnValue(Promise.resolve({ my: "response" }));
    //   return eventCommand({}).then(data => {
    //     expect(data.requestBody).toBeDefined();
    //     expect(data.responseBody).toEqual({ my: "response" });
    //   });
    // });
    //
    // it("sends expectsResponse == true", () => {
    //   onBeforeEventSpy.and.callFake(({ event }) => {
    //     event.expectResponse();
    //     return Promise.resolve();
    //   });
    //   return eventCommand({}).then(() => {
    //     expect(sendRequestSpy).toHaveBeenCalledWith(
    //       jasmine.anything(),
    //       true,
    //       false
    //     );
    //   });
    // });
    //
    // it("sends expectsResponse == false", () => {
    //   return eventCommand({}).then(() => {
    //     expect(sendRequestSpy).toHaveBeenCalledWith(
    //       jasmine.anything(),
    //       false,
    //       false
    //     );
    //   });
    // });
    //
    // describe("privacy", () => {
    //   it("calls onBeforeEvent before consent and onBeforeDataCollection after", () => {
    //     const deferred = defer();
    //     optIn.whenOptedIn = () => deferred.promise;
    //     eventCommand({});
    //     return flushPromiseChains()
    //       .then(() => {
    //         expect(onBeforeEventSpy).toHaveBeenCalled();
    //         expect(onBeforeDataCollectionSpy).not.toHaveBeenCalled();
    //         deferred.resolve();
    //         return flushPromiseChains();
    //       })
    //       .then(() => {
    //         expect(onBeforeDataCollectionSpy).toHaveBeenCalled();
    //       });
    //   });
    // });
  });
});
