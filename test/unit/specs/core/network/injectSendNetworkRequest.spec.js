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

describe("injectSendNetworkRequest", () => {
  const url = "https://example.com";
  const payload = {
    a: "b",
    getDocumentMayUnload() {
      return true;
    }
  };
  const payloadJson = JSON.stringify(payload);
  const requestId = "RID123";

  let logger;

  const responseBody = { requestId: "myrequestid", handle: [] };
  const responseBodyJson = JSON.stringify(responseBody);

  let sendNetworkRequest;
  let networkStrategy;
  let isRetryableHttpStatusCode;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", [
      "logOnBeforeNetworkRequest",
      "logOnNetworkResponse",
      "logOnNetworkError"
    ]);
    logger.enabled = true;
    networkStrategy = jasmine.createSpy().and.returnValue(
      Promise.resolve({
        status: 200,
        body: responseBodyJson
      })
    );
    isRetryableHttpStatusCode = jasmine
      .createSpy("isRetryableHttpStatusCode")
      .and.returnValue(false);

    sendNetworkRequest = injectSendNetworkRequest({
      logger,
      networkStrategy,
      isRetryableHttpStatusCode
    });
  });

  it("sends the request", () => {
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(() => {
      expect(logger.logOnBeforeNetworkRequest).toHaveBeenCalledWith({
        requestId,
        url,
        payload: {
          a: "b"
        }
      });
      expect(networkStrategy).toHaveBeenCalledWith({
        url,
        body: payloadJson,
        documentMayUnload: true
      });
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
        payload: {
          a: "b"
        },
        status: 200,
        body: responseBodyJson,
        parsedBody: responseBody,
        retriesAttempted: 0
      });
      expect(response).toEqual({
        statusCode: 200,
        body: responseBodyJson,
        parsedBody: responseBody
      });
    });
  });

  it("handles a response with a non-JSON body", () => {
    networkStrategy.and.returnValue(
      Promise.resolve({
        status: 200,
        body: "non-JSON body"
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
        status: 200,
        body: "non-JSON body",
        parsedBody: undefined,
        retriesAttempted: 0
      });
      expect(response).toEqual({
        statusCode: 200,
        body: "non-JSON body",
        parsedBody: undefined
      });
    });
  });

  it("handles a response with an empty body", () => {
    networkStrategy.and.returnValue(
      Promise.resolve({
        status: 200,
        body: ""
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
        status: 200,
        body: "",
        parsedBody: undefined,
        retriesAttempted: 0
      });
      expect(response).toEqual({
        statusCode: 200,
        body: "",
        parsedBody: undefined
      });
    });
  });

  it("rejects the promise when a network error occurs", () => {
    networkStrategy.and.returnValue(Promise.reject(new Error("networkerror")));
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
        parsedBody: responseBody
      });
    });
  });

  it(`retries certain status codes until success`, () => {
    isRetryableHttpStatusCode.and.returnValues(true, true, false);
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(response => {
      expect(response).toEqual({
        statusCode: 200,
        body: responseBodyJson,
        parsedBody: responseBody
      });
      expect(networkStrategy).toHaveBeenCalledTimes(3);
    });
  });

  it(`retries certain status codes until max retries met`, () => {
    isRetryableHttpStatusCode.and.returnValues(true, true, true);
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(response => {
      expect(response).toEqual({
        statusCode: 200,
        body: responseBodyJson,
        parsedBody: responseBody
      });
      expect(networkStrategy).toHaveBeenCalledTimes(4);
    });
  });
});
