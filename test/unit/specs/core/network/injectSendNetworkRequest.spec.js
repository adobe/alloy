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

import injectSendNetworkRequest from "../../../../../src/core/network/injectSendNetworkRequest";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

describe("injectSendNetworkRequest", () => {
  const url = "https://example.com";
  const payload = {
    a: "b"
  };
  const payloadJson = JSON.stringify(payload);
  const requestId = "RID123";

  let logger;

  const responseBody = { requestId: "myrequestid", handle: [] };
  const responseBodyJson = JSON.stringify(responseBody);

  let sendNetworkRequest;
  let sendFetchRequest;
  let sendBeaconRequest;
  let isRequestRetryable;
  let getRequestRetryDelay;
  let getHeader;

  beforeEach(() => {
    jasmine.clock().install();
    logger = jasmine.createSpyObj("logger", [
      "logOnBeforeNetworkRequest",
      "logOnNetworkResponse",
      "logOnNetworkError"
    ]);
    logger.enabled = true;
    getHeader = jasmine.createSpy("getHeader");
    sendFetchRequest = jasmine.createSpy().and.returnValue(
      Promise.resolve({
        statusCode: 200,
        body: responseBodyJson,
        getHeader
      })
    );
    sendBeaconRequest = jasmine.createSpy().and.returnValue(
      Promise.resolve({
        statusCode: 204,
        body: "",
        getHeader: () => undefined
      })
    );
    isRequestRetryable = jasmine
      .createSpy("isRequestRetryable")
      .and.returnValue(false);
    getRequestRetryDelay = jasmine
      .createSpy("getRequestRetryDelay")
      .and.returnValue(1000);

    sendNetworkRequest = injectSendNetworkRequest({
      logger,
      sendFetchRequest,
      sendBeaconRequest,
      isRequestRetryable,
      getRequestRetryDelay
    });
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it("sends the request", () => {
    return sendNetworkRequest({
      requestId,
      payload,
      url,
      useSendBeacon: false
    }).then(() => {
      expect(logger.logOnBeforeNetworkRequest).toHaveBeenCalledWith({
        requestId,
        url,
        payload
      });
      expect(sendFetchRequest).toHaveBeenCalledWith(url, payloadJson);
    });
  });

  it("handles a response with a JSON body", () => {
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(response => {
      expect(logger.logOnNetworkResponse).toHaveBeenCalledWith({
        requestId,
        url,
        payload,
        statusCode: 200,
        body: responseBodyJson,
        parsedBody: responseBody,
        retriesAttempted: 0,
        getHeader
      });
      expect(response).toEqual({
        statusCode: 200,
        body: responseBodyJson,
        parsedBody: responseBody,
        getHeader
      });
    });
  });

  it("handles a response with a non-JSON body", () => {
    sendFetchRequest.and.returnValue(
      Promise.resolve({
        statusCode: 200,
        body: "non-JSON body",
        getHeader
      })
    );
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(response => {
      expect(logger.logOnNetworkResponse).toHaveBeenCalledWith({
        requestId,
        url,
        payload: {
          a: "b"
        },
        statusCode: 200,
        body: "non-JSON body",
        parsedBody: undefined,
        retriesAttempted: 0,
        getHeader
      });
      expect(response).toEqual({
        statusCode: 200,
        body: "non-JSON body",
        parsedBody: undefined,
        getHeader
      });
    });
  });

  it("handles a response with an empty body", () => {
    sendFetchRequest.and.returnValue(
      Promise.resolve({
        statusCode: 200,
        body: "",
        getHeader
      })
    );
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(response => {
      expect(logger.logOnNetworkResponse).toHaveBeenCalledWith({
        requestId,
        url,
        payload: {
          a: "b"
        },
        statusCode: 200,
        body: "",
        parsedBody: undefined,
        retriesAttempted: 0,
        getHeader
      });
      expect(response).toEqual({
        statusCode: 200,
        body: "",
        parsedBody: undefined,
        getHeader
      });
    });
  });

  it("rejects the promise when a network error occurs", () => {
    sendFetchRequest.and.returnValue(Promise.reject(new Error("networkerror")));
    return sendNetworkRequest({
      payload,
      url,
      requestId
    })
      .then(fail)
      .catch(error => {
        expect(error.message).toEqual(
          "Network request failed.\nCaused by: networkerror"
        );
      });
  });

  it("resolves the promise for successful status and valid json", () => {
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(response => {
      expect(response).toEqual({
        statusCode: 200,
        body: responseBodyJson,
        parsedBody: responseBody,
        getHeader
      });
    });
  });

  it(`retries requests until request is no longer retryable`, () => {
    isRequestRetryable.and.returnValues(true, true, false);
    sendNetworkRequest({
      payload,
      url,
      requestId
    });

    expect(sendFetchRequest).toHaveBeenCalledTimes(1);
    return flushPromiseChains()
      .then(() => {
        expect(sendFetchRequest).toHaveBeenCalledTimes(1);
        jasmine.clock().tick(1000);
        expect(sendFetchRequest).toHaveBeenCalledTimes(2);
        return flushPromiseChains();
      })
      .then(() => {
        expect(sendFetchRequest).toHaveBeenCalledTimes(2);
        jasmine.clock().tick(1000);
        expect(sendFetchRequest).toHaveBeenCalledTimes(3);
        return flushPromiseChains();
      })
      .then(() => {
        expect(sendFetchRequest).toHaveBeenCalledTimes(3);
        jasmine.clock().tick(1000);
        expect(sendFetchRequest).toHaveBeenCalledTimes(3);
      });
  });
});
