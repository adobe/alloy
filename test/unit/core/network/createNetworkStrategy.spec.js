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

import createNetworkStrategy from "../../../../src/core/network/createNetworkStrategy";

const mockServerClient = window.mockServerClient || (() => {});
/**
 * These tests require a mock server to be running to do the verification
 * Run the mock server with `npm run mockserver`.  If this test sees there
 * is no mock server running, it will mark the tests as pending.
 */
describe("networkStrategyFactory", () => {
  const requestBody = JSON.stringify({ id: "myrequest" });

  let client;
  let networkStrategy;
  let mockServerRunning = false;

  // Check to see if the mock server is running:
  beforeAll(done => {
    new Promise((resolve, reject) => {
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
      })
      .finally(done);
  });

  const whenMockServerIsRunningIt = (name, doneFunc) => {
    it(name, done => {
      if (!mockServerRunning) {
        pending("Mock server is not running");
        done();
      } else {
        doneFunc(done);
      }
    });
  };

  [
    ["window", window],
    ["XMLHttpRequest", { XMLHttpRequest: window.XMLHttpRequest }]
  ].forEach(([name, testingWindow]) => {
    describe(name, () => {
      beforeEach(done => {
        if (!mockServerRunning) {
          done();
        } else {
          networkStrategy = createNetworkStrategy(testingWindow);
          client = mockServerClient("localhost", 1080);
          client.reset().then(() => done());
        }
      });

      const mockResponse = (code, body) => {
        return client.mockAnyResponse({
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
      };

      [200].forEach(code => {
        whenMockServerIsRunningIt(
          `handles successful response code ${code}`,
          done => {
            mockResponse(code, "mybody").then(() => {
              networkStrategy("http://localhost:1080/myapi", requestBody)
                .then(body => {
                  expect(body).toEqual("mybody");
                  done();
                })
                .catch(done.fail);
            });
          }
        );
      });

      whenMockServerIsRunningIt(
        "handles successful response code 204 (no content)",
        done => {
          mockResponse(204, "mybody").then(() => {
            networkStrategy("http://localhost:1080/myapi", requestBody)
              .then(body => {
                expect(body).toBeUndefined();
                done();
              })
              .catch(done.fail);
          });
        }
      );

      [301, 400, 403, 500].forEach(code => {
        whenMockServerIsRunningIt(
          `handles error response code ${code}`,
          done => {
            mockResponse(code, "mybody").then(() => {
              networkStrategy("http://localhost:1080/myapi", requestBody)
                .then(done.fail)
                .catch(error => {
                  expect(error).toBeDefined();
                  done();
                });
            });
          }
        );
      });

      whenMockServerIsRunningIt("handles a dropped connection", done => {
        client
          .mockAnyResponse({
            httpRequest: {
              method: "POST",
              path: "/myapi"
            },
            httpError: {
              dropConnection: true
            }
          })
          .then(() => {
            networkStrategy("http://localhost:1080/myapi", requestBody)
              .then(done.fail)
              .catch(error => {
                expect(error).toBeDefined();
                done();
              });
          });
      });

      whenMockServerIsRunningIt("sends a beacon", done => {
        client
          .mockAnyResponse({
            httpRequest: {
              method: "POST",
              path: "/myapi"
            },
            httpResponse: {
              statusCode: 204
            }
          })
          .then(() => {
            networkStrategy("http://localhost:1080/myapi", requestBody, true)
              .then(body => {
                expect(body).toBeUndefined();
                setTimeout(() => {
                  client
                    .verify(
                      {
                        method: "POST",
                        path: "/myapi",
                        body: requestBody
                      },
                      1,
                      1
                    ) // verify atLeast 1, atMost 1 times called
                    .then(done, done.fail);
                }, 500);
              })
              .catch(done.fail);
          });
      });
    });
  });
});
