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

import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import injectSendNetworkRequest from "../../../../../src/core/network/injectSendNetworkRequest.js";
import flushPromiseChains from "../../../helpers/flushPromiseChains.js";

describe("injectSendNetworkRequest", () => {
  const url = "https://example.com";
  const payload = {
    a: "b",
  };
  const payloadJson = JSON.stringify(payload);
  const requestId = "RID123";
  let logger;
  const responseBody = {
    requestId: "myrequestid",
    handle: [],
  };
  const responseBodyJson = JSON.stringify(responseBody);
  let sendNetworkRequest;
  let sendFetchRequest;
  let sendBeaconRequest;
  let isRequestRetryable;
  let getRequestRetryDelay;
  let getHeader;
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1998, 11, 19));
    logger = {
      logOnBeforeNetworkRequest: vi.fn(),
      logOnNetworkResponse: vi.fn(),
      logOnNetworkError: vi.fn(),
    };
    logger.enabled = true;
    getHeader = vi.fn();
    sendFetchRequest = vi.fn().mockReturnValue(
      Promise.resolve({
        statusCode: 200,
        body: responseBodyJson,
        getHeader,
      }),
    );
    sendBeaconRequest = vi.fn().mockReturnValue(
      Promise.resolve({
        statusCode: 204,
        body: "",
        getHeader: () => undefined,
      }),
    );
    isRequestRetryable = vi.fn().mockReturnValue(false);
    getRequestRetryDelay = vi.fn().mockReturnValue(1000);
    sendNetworkRequest = injectSendNetworkRequest({
      logger,
      sendFetchRequest,
      sendBeaconRequest,
      isRequestRetryable,
      getRequestRetryDelay,
    });
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it("sends the request", () => {
    return sendNetworkRequest({
      requestId,
      payload,
      url,
      useSendBeacon: false,
    }).then(() => {
      expect(logger.logOnBeforeNetworkRequest).toHaveBeenCalledWith({
        requestId,
        url,
        payload,
      });
      expect(sendFetchRequest).toHaveBeenCalledWith(
        url,
        payloadJson,
        undefined,
        {
          keepalive: false,
        },
      );
    });
  });

  it("forwards headers through to sendFetchRequest", () => {
    return sendNetworkRequest({
      requestId,
      payload,
      url,
      useSendBeacon: false,
      headers: { Authorization: "Bearer token" },
    }).then(() => {
      expect(sendFetchRequest).toHaveBeenCalledWith(
        url,
        payloadJson,
        { Authorization: "Bearer token" },
        { keepalive: false },
      );
    });
  });

  it("uses fetch instead of sendBeacon when headers are present, since sendBeacon can't carry custom headers", () => {
    return sendNetworkRequest({
      requestId,
      payload,
      url,
      useSendBeacon: true,
      headers: { Authorization: "Bearer token" },
    }).then(() => {
      expect(sendBeaconRequest).not.toHaveBeenCalled();
      expect(sendFetchRequest).toHaveBeenCalledWith(
        url,
        payloadJson,
        { Authorization: "Bearer token" },
        { keepalive: false },
      );
    });
  });
  it("sends the fetch request with keepalive when useKeepalive is true", () => {
    return sendNetworkRequest({
      requestId,
      payload,
      url,
      useSendBeacon: false,
      useKeepalive: true,
    }).then(() => {
      expect(sendFetchRequest).toHaveBeenCalledWith(
        url,
        payloadJson,
        undefined,
        {
          keepalive: true,
        },
      );
      expect(sendBeaconRequest).not.toHaveBeenCalled();
    });
  });

  it("uses sendBeacon instead of a keepalive fetch when useSendBeacon is true", () => {
    return sendNetworkRequest({
      requestId,
      payload,
      url,
      useSendBeacon: true,
      useKeepalive: true,
    }).then(() => {
      expect(sendBeaconRequest).toHaveBeenCalledWith(url, payloadJson);
      expect(sendFetchRequest).not.toHaveBeenCalled();
    });
  });

  it("handles a response with a JSON body", () => {
    return sendNetworkRequest({
      payload,
      url,
      requestId,
    }).then((response) => {
      expect(logger.logOnNetworkResponse).toHaveBeenCalledWith({
        requestId,
        url,
        payload,
        statusCode: 200,
        body: responseBodyJson,
        parsedBody: responseBody,
        retriesAttempted: 0,
        getHeader,
      });
      expect(response).toEqual({
        statusCode: 200,
        body: responseBodyJson,
        parsedBody: responseBody,
        getHeader,
      });
    });
  });
  it("handles a response with a non-JSON body", () => {
    sendFetchRequest.mockReturnValue(
      Promise.resolve({
        statusCode: 200,
        body: "non-JSON body",
        getHeader,
      }),
    );
    return sendNetworkRequest({
      payload,
      url,
      requestId,
    }).then((response) => {
      expect(logger.logOnNetworkResponse).toHaveBeenCalledWith({
        requestId,
        url,
        payload: {
          a: "b",
        },
        statusCode: 200,
        body: "non-JSON body",
        parsedBody: undefined,
        retriesAttempted: 0,
        getHeader,
      });
      expect(response).toEqual({
        statusCode: 200,
        body: "non-JSON body",
        parsedBody: undefined,
        getHeader,
      });
    });
  });
  it("handles a response with an empty body", () => {
    sendFetchRequest.mockReturnValue(
      Promise.resolve({
        statusCode: 200,
        body: "",
        getHeader,
      }),
    );
    return sendNetworkRequest({
      payload,
      url,
      requestId,
    }).then((response) => {
      expect(logger.logOnNetworkResponse).toHaveBeenCalledWith({
        requestId,
        url,
        payload: {
          a: "b",
        },
        statusCode: 200,
        body: "",
        parsedBody: undefined,
        retriesAttempted: 0,
        getHeader,
      });
      expect(response).toEqual({
        statusCode: 200,
        body: "",
        parsedBody: undefined,
        getHeader,
      });
    });
  });
  it("rejects the promise when a network error occurs", async () => {
    sendFetchRequest.mockReturnValue(Promise.reject(new Error("networkerror")));
    await expect(
      sendNetworkRequest({
        payload,
        url,
        requestId,
      }),
    ).rejects.toThrow("Network request failed.\nCaused by: networkerror");
  });
  it("resolves the promise for successful status and valid json", () => {
    return sendNetworkRequest({
      payload,
      url,
      requestId,
    }).then((response) => {
      expect(response).toEqual({
        statusCode: 200,
        body: responseBodyJson,
        parsedBody: responseBody,
        getHeader,
      });
    });
  });
  it(`retries requests until request is no longer retryable`, () => {
    isRequestRetryable
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    sendNetworkRequest({
      payload,
      url,
      requestId,
    });
    expect(sendFetchRequest).toHaveBeenCalledTimes(1);
    return flushPromiseChains()
      .then(() => {
        expect(sendFetchRequest).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(1000);
        expect(sendFetchRequest).toHaveBeenCalledTimes(2);
        return flushPromiseChains();
      })
      .then(() => {
        expect(sendFetchRequest).toHaveBeenCalledTimes(2);
        vi.advanceTimersByTime(1000);
        expect(sendFetchRequest).toHaveBeenCalledTimes(3);
        return flushPromiseChains();
      })
      .then(() => {
        expect(sendFetchRequest).toHaveBeenCalledTimes(3);
        vi.advanceTimersByTime(1000);
        expect(sendFetchRequest).toHaveBeenCalledTimes(3);
      });
  });
  it("passes sentWithBeacon from a sendBeacon response through to the logger", () => {
    sendBeaconRequest.mockReturnValue(
      Promise.resolve({
        statusCode: 204,
        body: "",
        getHeader,
        sentWithBeacon: true,
      }),
    );
    return sendNetworkRequest({
      requestId,
      payload,
      url,
      useSendBeacon: true,
    }).then(() => {
      expect(sendBeaconRequest).toHaveBeenCalledTimes(1);
      expect(sendFetchRequest).not.toHaveBeenCalled();
      expect(logger.logOnNetworkResponse).toHaveBeenCalledWith({
        requestId,
        url,
        payload,
        statusCode: 204,
        body: "",
        parsedBody: undefined,
        retriesAttempted: 0,
        getHeader,
        sentWithBeacon: true,
      });
    });
  });
});
