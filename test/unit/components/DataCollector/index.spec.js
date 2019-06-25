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

import createDataCollector from "../../../../src/components/DataCollector/index";
import createPayload from "../../../../src/core/network/createPayload";
import { defer } from "../../../../src/utils";

const flushPromises = () => {
  const deferred = defer();
  setTimeout(deferred.resolve, 0);
  return deferred.promise;
};

describe("Event Command", () => {
  let eventCommand;
  let onBeforeEventSpy;
  let onBeforeDataCollectionSpy;
  let sendRequestSpy;
  const lifecycle = {
    onBeforeEvent: () => Promise.resolve(),
    onBeforeDataCollection: () => Promise.resolve()
  };
  const network = {
    createPayload,
    sendRequest: () => Promise.resolve({})
  };
  beforeEach(() => {
    onBeforeEventSpy = spyOn(lifecycle, "onBeforeEvent").and.callThrough();
    onBeforeDataCollectionSpy = spyOn(
      lifecycle,
      "onBeforeDataCollection"
    ).and.callThrough();
    sendRequestSpy = spyOn(network, "sendRequest").and.callThrough();
    const dataCollector = createDataCollector();
    dataCollector.lifecycle.onComponentsRegistered({ lifecycle, network });
    eventCommand = dataCollector.commands.event;
  });

  it("Calls onBeforeEvent", () => {
    return eventCommand({}).then(() => {
      expect(lifecycle.onBeforeEvent).toHaveBeenCalledWith(
        jasmine.anything(),
        false
      );
    });
  });
  it("Extracts isViewStart for onBeforeEvent", () => {
    return eventCommand({ type: "viewStart" }).then(() => {
      expect(lifecycle.onBeforeEvent).toHaveBeenCalledWith(
        jasmine.anything(),
        true
      );
    });
  });
  it("Calls onBeforeEvent with a matching event", () => {
    eventCommand({ data: { a: 1 }, meta: { b: 2 } }).then(() => {
      expect(lifecycle.onBeforeEvent.calls.argsFor(0)[0].toJSON().data).toEqual(
        { a: 1 }
      );
      expect(lifecycle.onBeforeEvent.calls.argsFor(0)[0].toJSON().meta).toEqual(
        { b: 2 }
      );
    });
  });

  it("Allows other components to modify the event", () => {
    onBeforeEventSpy.and.callFake(event => {
      event.mergeData({ a: "changed" });
      return Promise.resolve();
    });
    return eventCommand({ data: { a: 1 } }).then(() => {
      expect(
        network.sendRequest.calls
          .argsFor(0)[0]
          .toJSON()
          .events[0].toJSON().data
      ).toEqual({ a: "changed" });
    });
  });

  it("Allows other components to hold up the event", () => {
    const deferred = defer();
    onBeforeEventSpy.and.returnValue(deferred.promise);
    eventCommand({});
    return flushPromises().then(() => {
      expect(lifecycle.onBeforeEvent).toHaveBeenCalled();
      expect(network.sendRequest).not.toHaveBeenCalled();
      deferred.resolve();
      flushPromises().then(() => {
        expect(network.sendRequest).toHaveBeenCalled();
      });
    });
  });

  it("Sends the event through to the Network Gateway", () => {
    return eventCommand({ data: { a: 1 } }).then(() => {
      expect(network.sendRequest).toHaveBeenCalled();
    });
  });

  it("Calls onBeforeDataCollection", () => {
    return eventCommand({}).then(() => {
      expect(lifecycle.onBeforeDataCollection).toHaveBeenCalled();
    });
  });
  it("The promise on onBeforeDataCollection resolves", () => {
    return eventCommand({}).then(() => {
      return lifecycle.onBeforeDataCollection.calls.argsFor(0)[1].then(data => {
        expect(data.requestBody).toBeDefined();
        expect(data.responseBody).toBeDefined();
      });
    });
  });

  it("Waits for onBeforeDataCollection promises", () => {
    const deferred = defer();
    onBeforeDataCollectionSpy.and.returnValue(deferred.promise);
    eventCommand({});
    return flushPromises().then(() => {
      expect(lifecycle.onBeforeDataCollection).toHaveBeenCalled();
      expect(network.sendRequest).not.toHaveBeenCalled();
      deferred.resolve();
      flushPromises().then(() => {
        expect(network.sendRequest).toHaveBeenCalled();
      });
    });
  });

  it("Returns a promise resolved with the request and response", () => {
    sendRequestSpy.and.returnValue(Promise.resolve({ my: "response" }));
    return eventCommand({}).then(data => {
      expect(data.requestBody).toBeDefined();
      expect(data.responseBody).toEqual({ my: "response" });
    });
  });

  it("sends expectsResponse == true", () => {
    onBeforeEventSpy.and.callFake(event => {
      event.expectResponse();
      return Promise.resolve();
    });
    return eventCommand({}).then(() => {
      expect(network.sendRequest).toHaveBeenCalledWith(
        jasmine.anything(),
        true
      );
    });
  });

  it("sends expectsResponse == false", () => {
    return eventCommand({}).then(() => {
      expect(network.sendRequest).toHaveBeenCalledWith(
        jasmine.anything(),
        false
      );
    });
  });
});
