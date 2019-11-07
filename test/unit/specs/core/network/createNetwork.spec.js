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

import createNetwork from "../../../../../src/core/network/createNetwork";

describe("createNetwork", () => {
  const config = {
    edgeDomain: "alloy.mysite.com",
    edgeBasePath: "ee",
    configId: "myconfigId"
  };

  let logger;

  const mockResponse = { requestId: "myrequestid", handle: [] };

  let lifecycle;
  let network;
  let networkStrategy;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["log"]);
    logger.enabled = true;
    lifecycle = {
      onBeforeSend: jasmine.createSpy().and.returnValue(Promise.resolve()),
      onResponse: jasmine.createSpy().and.returnValue(Promise.resolve()),
      onResponseError: jasmine.createSpy().and.returnValue(Promise.resolve())
    };
    networkStrategy = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve(JSON.stringify(mockResponse)));
    network = createNetwork({ config, logger, lifecycle, networkStrategy });
  });

  it("can call interact", () => {
    return network.sendRequest({}).then(() => {
      expect(networkStrategy).toHaveBeenCalledWith(
        jasmine.stringMatching(
          /^https:\/\/alloy\.mysite\.com\/ee\/v1\/interact\?configId=myconfigId&requestId=[0-9a-f-]+$/
        ),
        "{}",
        false
      );
    });
  });

  it("can call collect", () => {
    return network.sendRequest({}, { expectsResponse: false }).then(() => {
      expect(networkStrategy).toHaveBeenCalledWith(
        jasmine.stringMatching(
          /^https:\/\/alloy\.mysite\.com\/ee\/v1\/collect\?configId=myconfigId&requestId=[0-9a-f-]+$/
        ),
        "{}",
        false
      );
    });
  });

  it("can call collect when the document is unloading", () => {
    return network
      .sendRequest({}, { expectsResponse: false, documentUnloading: true })
      .then(() => {
        expect(networkStrategy).toHaveBeenCalledWith(
          jasmine.stringMatching(
            /^https:\/\/alloy\.mysite\.com\/ee\/v1\/collect\?configId=myconfigId&requestId=[0-9a-f-]+$/
          ),
          "{}",
          true
        );
      });
  });

  it("uses collect when a request expects a response and is an exit link", () => {
    return network
      .sendRequest({}, { expectsResponse: true, documentUnloading: true })
      .then(() => {
        expect(networkStrategy).toHaveBeenCalledWith(
          jasmine.stringMatching(
            /^https:\/\/alloy\.mysite\.com\/ee\/v1\/collect\?configId=myconfigId&requestId=[0-9a-f-]+$/
          ),
          "{}",
          true
        );
      });
  });

  it("supports custom edgeBasePath settings", () => {
    const { edgeDomain, configId } = config;
    network = createNetwork({
      config: { edgeDomain, configId, edgeBasePath: "ee-beta-1" },
      logger,
      lifecycle,
      networkStrategy
    });
    return network.sendRequest({}, { documentUnloading: true }).then(() => {
      expect(networkStrategy).toHaveBeenCalledWith(
        jasmine.stringMatching(
          /^https:\/\/alloy\.mysite\.com\/ee-beta-1\/v1\/collect\?configId=myconfigId&requestId=[0-9a-f-]+$/
        ),
        "{}",
        true
      );
    });
  });

  it("sends the payload", () => {
    return network.sendRequest({ id: "mypayload" }).then(() => {
      expect(JSON.parse(networkStrategy.calls.argsFor(0)[1])).toEqual({
        id: "mypayload"
      });
    });
  });

  it("logs the request and response when response is expected", () => {
    const payload = { id: "mypayload2" };
    return network.sendRequest(payload, { expectsResponse: true }).then(() => {
      expect(logger.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/^Request .+: Sending request.$/),
        JSON.parse(JSON.stringify(payload))
      );
      expect(logger.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/^Request .+: Received response.$/),
        mockResponse
      );
    });
  });

  it("logs only the request when no response is expected", () => {
    const payload = { id: "mypayload2" };
    return network.sendRequest(payload, { expectsResponse: false }).then(() => {
      expect(logger.log).toHaveBeenCalledWith(
        jasmine.stringMatching(
          /^Request .+: Sending request \(no response is expected\).$/
        ),
        JSON.parse(JSON.stringify(payload))
      );
      expect(logger.log.calls.count()).toBe(1);
    });
  });

  it("resolves the returned promise", () => {
    return network.sendRequest({}).then(response => {
      expect(response.getPayloadsByType).toEqual(jasmine.any(Function));
    });
  });

  it("runs onResponseError hook and rejects the returned promise with network error rather than lifecycle error", () => {
    networkStrategy.and.returnValue(Promise.reject(new Error("networkerror")));
    lifecycle.onResponseError.and.returnValue(
      Promise.reject(new Error("lifecycleerror"))
    );
    return network
      .sendRequest({})
      .then(() => {
        // If sendRequest resolves instead of rejects, we want this test to fail.
        throw Error("Expected sendRequest to reject promise.");
      })
      .catch(error => {
        expect(lifecycle.onResponseError).toHaveBeenCalledWith({
          error,
          requestId: jasmine.anything()
        });
        expect(error.message).toEqual(
          "Network request failed.\nCaused by: networkerror"
        );
      });
  });

  it("runs onResponseError hook and rejects the promise when response is invalid json", () => {
    networkStrategy.and.returnValue(Promise.resolve("badbody"));
    return network
      .sendRequest({})
      .then(() => {
        // If sendRequest resolves instead of rejects, we want this test to fail.
        throw Error("Expected sendRequest to reject promise.");
      })
      .catch(error => {
        expect(lifecycle.onResponseError).toHaveBeenCalledWith({
          error,
          requestId: jasmine.anything()
        });
        // The native parse error message is different based on the browser
        // so we'll just check to parts we control.
        expect(error.message).toContain("Error parsing server response.\n");
        expect(error.message).toContain("\nResponse body: badbody");
      });
  });

  it("allows components to handle the response", () => {
    const myresponse = {
      requestId: "myrequestid",
      handle: [
        {
          type: "mytype",
          payload: { id: "myfragmentid" }
        }
      ]
    };
    lifecycle.onResponse.and.callFake(({ response, requestId }) => {
      const cleanResponse = response.toJSON();
      expect(cleanResponse).toEqual(myresponse);
      expect(requestId).toBeDefined();
      return Promise.resolve();
    });
    networkStrategy.and.returnValue(
      Promise.resolve(JSON.stringify(myresponse))
    );
    return network.sendRequest({}).then(() => {
      expect(lifecycle.onResponse).toHaveBeenCalled();
    });
  });

  it("doesn't try to parse the response on a beacon call", () => {
    networkStrategy.and.returnValue(Promise.resolve("bar"));
    // a failed promise will fail the test
    return network.sendRequest({}, { expectsResponse: false });
  });

  it("retries failed requests until success", () => {
    const fn = networkStrategy.and.callFake(() => {
      return fn.calls.count() < 3
        ? Promise.reject()
        : Promise.resolve(JSON.stringify(mockResponse));
    });
    return network.sendRequest({}).then(() => {
      expect(networkStrategy).toHaveBeenCalledTimes(3);
    });
  });

  it("retries failed requests until max retries met", () => {
    networkStrategy.and.returnValue(Promise.reject(new Error("bad thing")));
    return network.sendRequest({}).catch(error => {
      expect(networkStrategy).toHaveBeenCalledTimes(4);
      expect(error.message).toBe(
        "Network request failed.\nCaused by: bad thing"
      );
    });
  });
});
