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

import sendNetworkRequestFactory from "../../../../../src/core/network/sendNetworkRequestFactory";

describe("sendNetworkRequestFactory", () => {
  const url = "https://example.com";
  const payload = { a: "b" };
  const payloadJson = JSON.stringify(payload);
  const requestId = "RID123";

  let logger;

  const responseBody = { requestId: "myrequestid", handle: [] };
  const responseBodyJson = JSON.stringify(responseBody);

  let sendNetworkRequest;
  let networkStrategy;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["log"]);
    logger.enabled = true;
    networkStrategy = jasmine.createSpy().and.returnValue(
      Promise.resolve({
        status: 200,
        body: responseBodyJson
      })
    );
    sendNetworkRequest = sendNetworkRequestFactory({
      logger,
      networkStrategy
    });
  });

  it("sends the payload", () => {
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(() => {
      expect(networkStrategy.calls.argsFor(0)).toEqual([url, payloadJson]);
    });
  });

  it("logs the request", () => {
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(() => {
      expect(logger.log).toHaveBeenCalledWith(
        jasmine.stringMatching(/^Request .+: Sending request.$/),
        payload
      );
    });
  });

  it("logs the response with parsable body", () => {
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(() => {
      expect(logger.log).toHaveBeenCalledWith(
        jasmine.stringMatching(
          /^Request .+: Received response with status code 200 and response body:$/
        ),
        responseBody
      );
    });
  });

  it("logs the response with non-parsable body", () => {
    networkStrategy.and.returnValue(
      Promise.resolve({
        status: 500,
        body: "invalidbody"
      })
    );
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(() => {
      expect(logger.log).toHaveBeenCalledWith(
        jasmine.stringMatching(
          /^Request .+: Received response with status code 500 and response body:$/
        ),
        "invalidbody"
      );
    });
  });

  it("logs the response with no body", () => {
    networkStrategy.and.returnValue(
      Promise.resolve({
        status: 500,
        body: ""
      })
    );
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(() => {
      expect(logger.log).toHaveBeenCalledWith(
        jasmine.stringMatching(
          /^Request .+: Received response with status code 500 and no response body\.$/
        ),
        ""
      );
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
    }).then(result => {
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        body: responseBodyJson,
        parsedBody: responseBody
      });
    });
  });

  it("resolves the promise for successful status and invalid json", () => {
    networkStrategy.and.returnValue(
      Promise.resolve({ status: 200, body: "invalidbody" })
    );
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(result => {
      expect(result).toEqual({
        success: false,
        statusCode: 200,
        body: "invalidbody",
        parsedBody: undefined
      });
    });
  });

  it("resolves the promise for unsuccessful status and valid json", () => {
    networkStrategy.and.returnValue(
      Promise.resolve({ status: 500, body: responseBodyJson })
    );
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(result => {
      expect(result).toEqual({
        success: false,
        statusCode: 500,
        body: responseBodyJson,
        parsedBody: responseBody
      });
    });
  });

  it("resolves the promise for unsuccessful status and invalid json", () => {
    networkStrategy.and.returnValue(
      Promise.resolve({ status: 500, body: "invalidbody" })
    );
    return sendNetworkRequest({
      payload,
      url,
      requestId
    }).then(result => {
      expect(result).toEqual({
        success: false,
        statusCode: 500,
        body: "invalidbody",
        parsedBody: undefined
      });
    });
  });

  // Retryable failure status codes
  [429, 500, 599].forEach(status => {
    it(`retries requests for responses with status code ${status} until success`, () => {
      const fn = networkStrategy.and.callFake(() => {
        const result =
          fn.calls.count() < 3
            ? { status, body: "Server fault" }
            : { status: 200, body: responseBodyJson };

        return Promise.resolve(result);
      });
      return sendNetworkRequest({
        payload,
        url,
        requestId
      }).then(() => {
        expect(networkStrategy).toHaveBeenCalledTimes(3);
      });
    });

    it(`retries requests for responses with status code ${status} until max retries met`, () => {
      networkStrategy.and.returnValue(
        Promise.resolve({ status, body: "Server fault" })
      );
      return sendNetworkRequest({
        payload,
        url,
        requestId
      }).then(() => {
        expect(networkStrategy).toHaveBeenCalledTimes(4);
      });
    });
  });

  // Non-retryable failure status codes
  [205, 400, 499].forEach(status => {
    it(`does not retry requests for responses with status code ${status}`, () => {
      networkStrategy.and.returnValue(
        Promise.resolve({ status, body: "Server fault" })
      );
      return sendNetworkRequest({
        payload,
        url,
        requestId
      }).then(() => {
        expect(networkStrategy).toHaveBeenCalledTimes(1);
      });
    });
  });

  // Success status codes
  [200, 204].forEach(status => {
    it(`does not retry requests for responses with status code ${status}`, () => {
      networkStrategy.and.callFake(() => {
        return Promise.resolve({
          status,
          body: responseBodyJson
        });
      });
      return sendNetworkRequest({
        payload,
        url,
        requestId
      }).then(() => {
        expect(networkStrategy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
