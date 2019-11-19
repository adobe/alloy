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

import createNetworkStrategy from "../../../../../src/core/network/createNetworkStrategy";

const mockServerClient = window.mockServerClient || (() => {});

// the mockserver client library just returns objects with a "then" method.  In order to do
// promise chaining, we need to wrap these "fake" promises in real ones.
const wrapInRealPromises = client => {
  return Object.keys(client).reduce((memo, functionName) => {
    memo[functionName] = (...args) => {
      return new Promise((resolve, reject) => {
        client[functionName](...args).then(resolve, reject);
      });
    };
    return memo;
  }, {});
};

const eventually = (
  testFunction,
  checks = 5,
  millisecondsBetweenChecks = 100
) => {
  return new Promise((resolve, reject) => {
    const check = remainingChecks => {
      setTimeout(() => {
        testFunction()
          .then(resolve)
          .catch(error => {
            if (remainingChecks <= 0) {
              reject(error);
            } else {
              check(remainingChecks - 1);
            }
          });
      }, millisecondsBetweenChecks);
    };
    check(checks);
  });
};

/**
 * These tests require a mock server to be running to do the verification
 * Run the mock server with `npm run mockserver`.  If this test sees there
 * is no mock server running, it will mark the tests as pending.
 */
describe("networkStrategyFactory", () => {
  const requestBody = JSON.stringify({ id: "myrequest" });
  const largeRequestBody = JSON.stringify({
    id: "mylargerequest",
    data: new Uint8Array(10 * 1024)
  });

  let client;
  let networkStrategy;
  let mockServerRunning = false;

  // Check to see if the mock server is running:
  beforeAll(() => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(reject, 500);
      fetch("http://localhost:1080/status", { method: "PUT" })
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeout));
    })
      .then(() => {
        mockServerRunning = true;
      })
      .catch(() => {
        mockServerRunning = false;
      });
  });

  const whenMockServerIsRunningIt = (name, testFunc) => {
    it(name, () => {
      if (mockServerRunning) {
        return testFunc();
      }
      pending("Mock server is not running");
      return Promise.resolve();
    });
  };

  [
    ["window", window],
    ["XMLHttpRequest", { XMLHttpRequest: window.XMLHttpRequest }]
  ].forEach(([name, testingWindow]) => {
    describe(name, () => {
      beforeEach(() => {
        if (mockServerRunning) {
          networkStrategy = createNetworkStrategy(testingWindow, console);
          client = wrapInRealPromises(mockServerClient("localhost", 1080));
          return client.reset();
        }
        return Promise.resolve();
      });

      const mockResponse = (code, body) => {
        const promise = client.mockAnyResponse({
          httpRequest: {
            method: "POST",
            path: "/myapi",
            body: {
              type: "JSON",
              json: requestBody,
              matchType: "STRICT"
            }
          },
          httpResponse: {
            statusCode: code,
            body
          }
        });
        return promise;
      };

      [200].forEach(code => {
        whenMockServerIsRunningIt(
          `handles successful response code ${code}`,
          () => {
            return mockResponse(code, "mybody")
              .then(() =>
                networkStrategy("http://localhost:1080/myapi", requestBody)
              )
              .then(result => {
                expect(result).toEqual({
                  status: 200,
                  body: "mybody"
                });
              });
          }
        );
      });

      whenMockServerIsRunningIt(
        "handles successful response code 204 (no content)",
        () => {
          return mockResponse(204, "mybody")
            .then(() =>
              networkStrategy("http://localhost:1080/myapi", requestBody)
            )
            .then(result => {
              expect(result).toEqual({
                status: 204,
                body: ""
              });
            });
        }
      );

      [301, 400, 403, 500].forEach(code => {
        whenMockServerIsRunningIt(`handles error response code ${code}`, () => {
          return mockResponse(code, "mybody")
            .then(() =>
              networkStrategy("http://localhost:1080/myapi", requestBody)
            )
            .then(result => {
              expect(result).toEqual({
                status: code,
                body: "mybody"
              });
            });
        });
      });

      whenMockServerIsRunningIt("handles a dropped connection", () => {
        return client
          .mockAnyResponse({
            httpRequest: {
              method: "POST",
              path: "/myapi"
            },
            httpError: {
              dropConnection: true
            }
          })
          .then(() =>
            networkStrategy("http://localhost:1080/myapi", requestBody)
          )
          .then(fail)
          .catch(error => {
            expect(error).toBeDefined();
          });
      });

      whenMockServerIsRunningIt("sends a beacon", () => {
        // use a different endpoint here, because when the test fails, the beacon could still go
        // out and cause other tests to fail.
        return client
          .mockAnyResponse({
            httpRequest: {
              method: "POST",
              path: "/smallbeacon"
            },
            httpResponse: {
              statusCode: 204
            }
          })
          .then(() =>
            networkStrategy(
              "http://localhost:1080/smallbeacon",
              requestBody,
              true
            )
          )
          .then(result => {
            expect(result).toEqual({
              status: 204,
              body: ""
            });
          })
          .then(() => {
            return eventually(() => {
              return client.verify(
                {
                  method: "POST",
                  path: "/smallbeacon",
                  body: requestBody
                },
                1,
                1
              ); // verify atLeast 1, atMost 1 times called
            });
          });
      });

      whenMockServerIsRunningIt("sends a large beacon", () => {
        return client
          .mockAnyResponse({
            httpRequest: {
              method: "POST",
              path: "/largebeacon"
            },
            httpResponse: {
              statusCode: 204
            }
          })
          .then(() =>
            networkStrategy(
              "http://localhost:1080/largebeacon",
              largeRequestBody,
              true
            )
          )
          .then(result =>
            expect(result).toEqual({
              status: 204,
              body: ""
            })
          )
          .then(() =>
            client.verify(
              {
                method: "POST",
                path: "/largebeacon",
                body: largeRequestBody
              },
              1,
              1
            )
          ); // verify atLeast 1, atMost 1 times called
      });
    });
  });
});
