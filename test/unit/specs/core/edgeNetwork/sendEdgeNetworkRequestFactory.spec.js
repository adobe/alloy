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

import sendEdgeNetworkRequestFactory from "../../../../../src/core/edgeNetwork/sendEdgeNetworkRequestFactory";
import createConfig from "../../../../../src/core/config/createConfig";
import { defer } from "../../../../../src/utils";
import flushPromiseChains from "../../../helpers/flushPromiseChains";
import assertFunctionCallOrder from "../../../helpers/assertFunctionCallOrder";

describe("sendEdgeNetworkRequestFactory", () => {
  const config = createConfig({
    edgeDomain: "edge.example.com",
    edgeBasePath: "ee",
    configId: "myconfigId"
  });
  let logger;
  let lifecycle;
  let cookieTransfer;
  let networkResult;
  let sendNetworkRequest;
  let response;
  let createResponse;
  let processWarningsAndErrors;
  let sendEdgeNetworkRequest;
  const payload = {
    getUseIdThirdPartyDomain() {
      return false;
    }
  };
  const action = "test-action";

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["log"]);
    lifecycle = jasmine.createSpyObj("lifecycle", {
      onRequestFailure: Promise.resolve(),
      onResponse: Promise.resolve()
    });
    cookieTransfer = jasmine.createSpyObj("cookieTransfer", [
      "cookiesToPayload",
      "responseToCookies"
    ]);
    networkResult = {
      success: true,
      statusCode: 200,
      body: "{}",
      parsedBody: {}
    };
    sendNetworkRequest = jasmine
      .createSpy("sendNetworkRequest")
      .and.returnValue(Promise.resolve(networkResult));
    response = { type: "response" };
    createResponse = jasmine
      .createSpy("createResponse")
      .and.returnValue(response);
    processWarningsAndErrors = jasmine.createSpy("processWarningsAndErrors");
    sendEdgeNetworkRequest = sendEdgeNetworkRequestFactory({
      config,
      logger,
      lifecycle,
      cookieTransfer,
      sendNetworkRequest,
      createResponse,
      processWarningsAndErrors
    });
  });

  it("transfers cookies to payload when sending to first-party domain", () => {
    payload.getUseIdThirdPartyDomain = () => false;
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(cookieTransfer.cookiesToPayload).toHaveBeenCalledWith(
        payload,
        "edge.example.com"
      );
    });
  });

  it("transfers cookies to payload when sending to third-party domain", () => {
    payload.getUseIdThirdPartyDomain = () => true;
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(cookieTransfer.cookiesToPayload).toHaveBeenCalledWith(
        payload,
        "adobedc.demdex.net"
      );
    });
  });

  it("sends request to first-party domain", () => {
    payload.getUseIdThirdPartyDomain = () => false;
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        payload,
        url: jasmine.stringMatching(
          /https:\/\/edge\.example\.com\/ee\/v1\/test-action\?configId=myconfigId&requestId=[0-9a-f-]+/
        ),
        requestId: jasmine.stringMatching(/^[0-9a-f-]+$/)
      });
    });
  });

  it("sends request to third-party domain", () => {
    payload.getUseIdThirdPartyDomain = () => true;
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(sendNetworkRequest).toHaveBeenCalledWith({
        payload,
        url: jasmine.stringMatching(
          /https:\/\/adobedc\.demdex\.net\/ee\/v1\/test-action\?configId=myconfigId&requestId=[0-9a-f-]+/
        ),
        requestId: jasmine.stringMatching(/^[0-9a-f-]+$/)
      });
    });
  });

  it("calls lifecycle.onRequestFailure, waits for it to complete, then rejects promise if network request fails", () => {
    const deferred = defer();
    lifecycle.onRequestFailure.and.returnValue(deferred.promise);
    sendNetworkRequest.and.returnValue(
      Promise.reject(new Error("no connection"))
    );
    const errorHandler = jasmine.createSpy("errorHandler");
    sendEdgeNetworkRequest({ payload, action })
      .then(fail)
      .catch(errorHandler);
    return flushPromiseChains()
      .then(() => {
        expect(lifecycle.onRequestFailure).toHaveBeenCalled();
        expect(errorHandler).not.toHaveBeenCalled();
        // We reject this deferred to simulate a component throwing an error
        // during the lifecycle.onRequestFailure hook. This tests that the
        // promise from sendEdgeNetworkRequest is rejected with the network
        // error rather than the error coming from a component.
        deferred.reject();
        return flushPromiseChains();
      })
      .then(() => {
        expect(errorHandler).toHaveBeenCalledWith(new Error("no connection"));
      });
  });

  it("if a parsedBody exists, transfers cookies from response before lifecycle.onResponse", () => {
    networkResult.parsedBody = {};
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(cookieTransfer.responseToCookies).toHaveBeenCalledWith(response);
      assertFunctionCallOrder([
        cookieTransfer.responseToCookies,
        lifecycle.onResponse
      ]);
    });
  });

  it("if a parsedBody does not exist, does not transfer cookies from response", () => {
    networkResult.parsedBody = undefined;
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(cookieTransfer.responseToCookies).not.toHaveBeenCalled();
    });
  });

  it("calls lifecycle.onResponse and waits for it to complete if response is successful and has a parsed body", () => {
    networkResult.success = true;
    networkResult.parsedBody = {};
    const deferred = defer();
    lifecycle.onResponse.and.returnValue(deferred.promise);
    const successHandler = jasmine.createSpy("successHandler");
    sendEdgeNetworkRequest({ payload, action }).then(successHandler);
    return flushPromiseChains()
      .then(() => {
        expect(lifecycle.onResponse).toHaveBeenCalledWith({ response });
        expect(successHandler).not.toHaveBeenCalled();
        deferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(successHandler).toHaveBeenCalled();
      });
  });

  it("does not call lifecycle.onResponse if response is successful but does not have parsed body", () => {
    networkResult.success = true;
    networkResult.parsedBody = undefined;
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(lifecycle.onResponse).not.toHaveBeenCalled();
    });
  });

  it("calls lifecycle.onRequestFailure and waits for it to complete if response is unsuccessful", () => {
    networkResult.success = false;
    networkResult.statusCode = 500;
    networkResult.body = "Server fault";
    networkResult.parsedBody = undefined;
    const deferred = defer();
    lifecycle.onRequestFailure.and.returnValue(deferred.promise);
    const errorHandler = jasmine.createSpy("errorHandler");
    sendEdgeNetworkRequest({ payload, action })
      .then(fail)
      .catch(errorHandler);
    return flushPromiseChains()
      .then(() => {
        expect(lifecycle.onRequestFailure).toHaveBeenCalled();
        expect(errorHandler).not.toHaveBeenCalled();
        deferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(errorHandler).toHaveBeenCalledWith(
          new Error(
            "Unexpected server response with status code 500 and response body: Server fault"
          )
        );
      });
  });

  it("processes warnings and errors if the response has a parsed body", () => {
    networkResult.parsedBody = {};
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(processWarningsAndErrors).toHaveBeenCalled();
    });
  });

  it("does not processes warnings and errors if the response does not have a parsed body", () => {
    networkResult.parsedBody = undefined;
    return sendEdgeNetworkRequest({ payload, action }).then(() => {
      expect(processWarningsAndErrors).not.toHaveBeenCalled();
    });
  });

  it("rejects the promise if error is thrown while processing warnings and errors", () => {
    processWarningsAndErrors.and.throwError(new Error("Invalid XDM"));
    return expectAsync(
      sendEdgeNetworkRequest({ payload, action })
    ).toBeRejectedWithError("Invalid XDM");
  });

  it("rejects the promise if the response is unsuccessful and a body exists", () => {
    networkResult.success = false;
    networkResult.statusCode = 500;
    networkResult.body = "Server fault";
    return expectAsync(
      sendEdgeNetworkRequest({ payload, action })
    ).toBeRejectedWithError(
      "Unexpected server response with status code 500 and response body: Server fault"
    );
  });

  it("rejects the promise if the response is unsuccessful and a body does not exist", () => {
    networkResult.success = false;
    networkResult.statusCode = 500;
    networkResult.body = "";
    return expectAsync(
      sendEdgeNetworkRequest({ payload, action })
    ).toBeRejectedWithError(
      "Unexpected server response with status code 500 and no response body."
    );
  });
});
