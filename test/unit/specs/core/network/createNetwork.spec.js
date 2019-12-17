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
import createConfig from "../../../../../src/core/config/createConfig";

describe("createNetwork", () => {
  const edgeDomain = "alloy.mysite.com";
  const config = createConfig({
    edgeBasePath: "ee",
    configId: "myconfigId"
  });

  let logger;

  const mockResponse = { requestId: "myrequestid", handle: [] };

  let network;
  let networkStrategy;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["log"]);
    logger.enabled = true;
    networkStrategy = jasmine.createSpy().and.returnValue(
      Promise.resolve({
        status: 200,
        body: JSON.stringify(mockResponse)
      })
    );
    network = createNetwork({
      config,
      logger,
      networkStrategy
    });
  });

  it("can call interact", () => {
    return network.sendRequest({}, edgeDomain).then(() => {
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
    return network
      .sendRequest({}, edgeDomain, { expectsResponse: false })
      .then(() => {
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
      .sendRequest({}, edgeDomain, {
        expectsResponse: false,
        documentUnloading: true
      })
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
      .sendRequest({}, edgeDomain, {
        expectsResponse: true,
        documentUnloading: true
      })
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
    const { configId } = config;
    network = createNetwork({
      config: createConfig({ configId, edgeBasePath: "ee-beta-1" }),
      logger,
      networkStrategy
    });
    return network
      .sendRequest({}, edgeDomain, { documentUnloading: true })
      .then(() => {
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
    return network.sendRequest({ id: "mypayload" }, edgeDomain).then(() => {
      expect(JSON.parse(networkStrategy.calls.argsFor(0)[1])).toEqual({
        id: "mypayload"
      });
    });
  });

  it("logs the request and response when response is expected", () => {
    const payload = { id: "mypayload2" };
    return network
      .sendRequest(payload, edgeDomain, { expectsResponse: true })
      .then(() => {
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
    return network
      .sendRequest(payload, edgeDomain, { expectsResponse: false })
      .then(() => {
        expect(logger.log).toHaveBeenCalledWith(
          jasmine.stringMatching(
            /^Request .+: Sending request \(no response is expected\).$/
          ),
          JSON.parse(JSON.stringify(payload))
        );
        expect(logger.log.calls.count()).toBe(1);
      });
  });

  it("rejects the promise when a network error occurs", () => {
    networkStrategy.and.returnValue(Promise.reject(new Error("networkerror")));
    return network
      .sendRequest({})
      .then(fail)
      .catch(error => {
        expect(error.message).toEqual(
          "Network request failed.\nCaused by: networkerror"
        );
      });
  });

  it("rejects the promise when response is invalid json", () => {
    networkStrategy.and.returnValue(
      Promise.resolve({ status: 200, body: "badbody" })
    );
    return network
      .sendRequest({}, edgeDomain)
      .then(fail)
      .catch(error => {
        // The native parse error message is different based on the browser
        // so we'll just check the parts we control.
        expect(error.message).toContain("Unexpected server response.\n");
        expect(error.message).toContain("\nResponse body: badbody");
      });
  });

  [429, 500, 599].forEach(status => {
    it(`retries requests for responses with status code ${status} until success`, () => {
      const fn = networkStrategy.and.callFake(() => {
        const result =
          fn.calls.count() < 3
            ? { status, body: "Server fault" }
            : { status: 200, body: JSON.stringify(mockResponse) };

        return Promise.resolve(result);
      });
      return network.sendRequest({}, edgeDomain).then(() => {
        expect(networkStrategy).toHaveBeenCalledTimes(3);
      });
    });

    it(`retries requests for responses with status code ${status} until max retries met`, () => {
      networkStrategy.and.returnValue(
        Promise.resolve({ status, body: "Server fault" })
      );
      return network.sendRequest({}, edgeDomain).catch(error => {
        expect(networkStrategy).toHaveBeenCalledTimes(4);
        expect(error.message).toBe(
          `Network request failed.\nCaused by: Unexpected response status code ${status}. Response was: Server fault`
        );
      });
    });
  });

  [205, 400, 499].forEach(status => {
    it(`does not retry requests for responses with status code ${status}`, () => {
      const fn = networkStrategy.and.callFake(() => {
        const result =
          fn.calls.count() < 3
            ? { status, body: "Server fault" }
            : { status: 200, body: JSON.stringify(mockResponse) };

        return Promise.resolve(result);
      });
      return network
        .sendRequest({}, edgeDomain)
        .then(fail)
        .catch(error => {
          expect(error.message).toBe(
            `Network request failed.\nCaused by: Unexpected response status code ${status}. Response was: Server fault`
          );
        });
    });
  });

  [200, 204].forEach(status => {
    it(`does not retry requests for responses with status code ${status}`, () => {
      networkStrategy.and.callFake(() => {
        return Promise.resolve({
          status: 200,
          body: JSON.stringify(mockResponse)
        });
      });
      return network.sendRequest({}, edgeDomain).then(() => {
        expect(networkStrategy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
