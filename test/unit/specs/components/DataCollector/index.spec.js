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

import createDataCollector from "../../../../../src/components/DataCollector/index";
import createPayload from "../../../../../src/core/network/createPayload";
import { defer } from "../../../../../src/utils";
import flushPromiseChains from "../../../helpers/flushPromiseChains";
import createConfig from "../../../../../src/core/createConfig";

const validConfigurations = [
  { propertyId: "", imsOrgId: "" },
  { propertyId: "myproperty1", imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg" },
  {
    propertyId: "myproperty1",
    edgeDomain: "stats.firstparty.com",
    imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
  },
  {
    propertyId: "myproperty1",
    edgeDomain: "STATS.FIRSTPARY.COM",
    imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
  },
  {
    propertyId: "myproperty1",
    edgeDomain: "STATS.FIRSTPARY.COM",
    prehidingStyle: "#foo",
    imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
  }
];

const invalidConfigurations = [
  {},
  { propertyId: "myproperty1", edgeDomain: "" },
  { propertyId: "myproperty1", edgeDomain: "stats firstparty.com" },
  {
    propertyId: "myproperty1",
    edgeDomain: "stats firstparty.com",
    prehidingStyle: ""
  }
];

const logger = {
  log() {},
  warn() {}
};
const config = {
  imsOrgId: "ABC123",
  get() {}
};

describe("Event Command", () => {
  let lifecycle;
  let network;
  let optIn;
  let onBeforeEventSpy;
  let onBeforeDataCollectionSpy;
  let sendRequestSpy;
  let eventCommand;
  beforeEach(() => {
    lifecycle = {
      onBeforeEvent: () => Promise.resolve(),
      onBeforeDataCollection: () => Promise.resolve()
    };
    network = {
      createPayload,
      sendRequest: () => Promise.resolve({})
    };
    optIn = {
      whenOptedIn: () => Promise.resolve()
    };
    onBeforeEventSpy = spyOn(lifecycle, "onBeforeEvent").and.callThrough();
    onBeforeDataCollectionSpy = spyOn(
      lifecycle,
      "onBeforeDataCollection"
    ).and.callThrough();
    sendRequestSpy = spyOn(network, "sendRequest").and.callThrough();
    const dataCollector = createDataCollector({
      config,
      logger
    });
    dataCollector.lifecycle.onComponentsRegistered({
      lifecycle,
      network,
      optIn
    });
    eventCommand = dataCollector.commands.event;
  });

  it("Calls onBeforeEvent", () => {
    const options = {};
    return eventCommand(options).then(() => {
      expect(lifecycle.onBeforeEvent).toHaveBeenCalledWith(
        jasmine.anything(),
        options,
        false,
        false
      );
    });
  });
  it("Extracts viewStart for onBeforeEvent", () => {
    const options = { viewStart: true, documentUnloading: false };
    return eventCommand(options).then(() => {
      expect(onBeforeEventSpy).toHaveBeenCalledWith(
        jasmine.anything(),
        options,
        true,
        false
      );
    });
  });
  it("Extracts documentUnloading for onBeforeEvent", () => {
    const options = { documentUnloading: true };
    return eventCommand(options).then(() => {
      expect(onBeforeEventSpy).toHaveBeenCalledWith(
        jasmine.anything(),
        options,
        false,
        true
      );
    });
  });
  it("Calls onBeforeEvent with a matching event", () => {
    const options = { data: { a: 1 }, meta: { b: 2 } };
    return eventCommand(options).then(() => {
      expect(onBeforeEventSpy).toHaveBeenCalledWith(
        jasmine.anything(),
        options,
        false,
        false
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
        network.sendRequest.calls.argsFor(0)[0].toJSON().events[0].data
      ).toEqual({ a: "changed" });
    });
  });

  it("Allows other components to hold up the event", () => {
    const deferred = defer();
    onBeforeEventSpy.and.returnValue(deferred.promise);
    eventCommand({});
    return flushPromiseChains()
      .then(() => {
        expect(onBeforeEventSpy).toHaveBeenCalled();
        expect(sendRequestSpy).not.toHaveBeenCalled();
        deferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(sendRequestSpy).toHaveBeenCalled();
      });
  });

  it("Sends the event through to the Network Gateway", () => {
    return eventCommand({ data: { a: 1 } }).then(() => {
      expect(sendRequestSpy).toHaveBeenCalled();
    });
  });

  it("Calls onBeforeDataCollection", () => {
    return eventCommand({}).then(() => {
      expect(onBeforeDataCollectionSpy).toHaveBeenCalled();
    });
  });

  it("Waits for onBeforeDataCollection promises", () => {
    const deferred = defer();
    onBeforeDataCollectionSpy.and.returnValue(deferred.promise);
    eventCommand({});
    return flushPromiseChains()
      .then(() => {
        expect(onBeforeDataCollectionSpy).toHaveBeenCalled();
        expect(sendRequestSpy).not.toHaveBeenCalled();
        deferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(sendRequestSpy).toHaveBeenCalled();
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
      expect(sendRequestSpy).toHaveBeenCalledWith(
        jasmine.anything(),
        true,
        false
      );
    });
  });

  it("sends expectsResponse == false", () => {
    return eventCommand({}).then(() => {
      expect(sendRequestSpy).toHaveBeenCalledWith(
        jasmine.anything(),
        false,
        false
      );
    });
  });

  it("sends documentUnloading == true", () => {
    return eventCommand({ documentUnloading: true }).then(() => {
      expect(sendRequestSpy).toHaveBeenCalledWith(
        jasmine.anything(),
        false,
        true
      );
    });
  });

  describe("privacy", () => {
    it("calls onBeforeEvent before consent and onBeforeDataCollection after", () => {
      const deferred = defer();
      optIn.whenOptedIn = () => deferred.promise;
      eventCommand({});
      return flushPromiseChains()
        .then(() => {
          expect(onBeforeEventSpy).toHaveBeenCalled();
          expect(onBeforeDataCollectionSpy).not.toHaveBeenCalled();
          deferred.resolve();
          return flushPromiseChains();
        })
        .then(() => {
          expect(onBeforeDataCollectionSpy).toHaveBeenCalled();
        });
    });
  });

  describe("configs", () => {
    validConfigurations.forEach((cfg, i) => {
      it(`validates configuration (${i})`, () => {
        const configObj = createConfig(cfg);
        configObj.addValidators(createDataCollector.configValidators);
        configObj.validate();
      });
    });

    invalidConfigurations.forEach((cfg, i) => {
      it(`invalidates configuration (${i})`, () => {
        const configObj = createConfig(cfg);
        configObj.addValidators(createDataCollector.configValidators);
        expect(() => configObj.validate()).toThrowError();
      });
    });
  });
});
