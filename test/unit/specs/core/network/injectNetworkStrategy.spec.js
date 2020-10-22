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

import { createServer, Response } from "miragejs";
import injectNetworkStrategy from "../../../../../src/core/network/injectNetworkStrategy";

const createMockServer = ({ responseCode, responseBody } = {}) => {
  return createServer({
    // Sets timing to 0 and hides Mirage logging.
    environment: "test",
    routes() {
      this.urlPrefix = "http://localhost:1080";
      this.post("/myapi", () => {
        return new Response(responseCode, {}, responseBody);
      });
    }
  });
};

// This function MUST be run AFTER createMockServer() is called,
// because Mirage replaces window.fetch and window.XMLHttpRequest with mocked
// versions. If we ran the below code first, the native methods would be used
// instead of the mocks because of how we pull the fetch and XMLHttpRequest
// methods off window both in the code below and inside injectNetworkStrategy.
const createNetworkStrategy = ({ simulateWindowWithoutFetch }) => {
  let testingWindow = window;

  if (simulateWindowWithoutFetch) {
    testingWindow = {
      XMLHttpRequest: window.XMLHttpRequest
    };
  }

  return injectNetworkStrategy({
    window: testingWindow,
    logger: console
  });
};

/**
 * These tests require a mock server to be running to do the verification
 * Run the mock server with `npm run mockserver`.  If this test sees there
 * is no mock server running, it will mark the tests as pending.
 */
describe("injectNetworkStrategy", () => {
  const requestBody = JSON.stringify({ id: "myrequest" });

  const scenarios = [
    {
      description: "window with fetch support",
      simulateWindowWithoutFetch: true
    },
    {
      description: "window without fetch support",
      simulateWindowWithoutFetch: false
    }
  ];

  scenarios.forEach(({ description, simulateWindowWithoutFetch }) => {
    describe(description, () => {
      [200].forEach(responseCode => {
        it(`handles successful response code ${responseCode}`, () => {
          const server = createMockServer({
            responseCode: 200,
            responseBody: "mybod"
          });
          const networkStrategy = createNetworkStrategy({
            simulateWindowWithoutFetch
          });

          return networkStrategy({
            url: "http://localhost:1080/myapi",
            body: requestBody
          }).then(result => {
            server.shutdown();
            expect(result).toEqual({
              status: 200,
              body: "mybod"
            });
          });
        });
      });

      it("handles successful response code 204 (no content)", () => {
        const server = createMockServer({
          responseCode: 204
        });
        const networkStrategy = createNetworkStrategy({
          simulateWindowWithoutFetch
        });

        return networkStrategy({
          url: "http://localhost:1080/myapi",
          body: requestBody
        }).then(result => {
          server.shutdown();
          expect(result).toEqual({
            status: 204,
            body: ""
          });
        });
      });

      [301, 400, 403, 500].forEach(responseCode => {
        it(`handles error response code ${responseCode}`, () => {
          const server = createMockServer({
            responseCode,
            responseBody: "mybod"
          });
          const networkStrategy = createNetworkStrategy({
            simulateWindowWithoutFetch
          });

          return networkStrategy({
            url: "http://localhost:1080/myapi",
            body: requestBody
          }).then(result => {
            server.shutdown();
            expect(result).toEqual({
              status: responseCode,
              body: "mybod"
            });
          });
        });
      });

      it("handles a dropped connection", () => {
        const server = createMockServer();
        const networkStrategy = createNetworkStrategy({
          simulateWindowWithoutFetch
        });

        // When a network connection is dropped, an error is thrown by the
        // browser, which then bubbles up through our networkStrategy module.
        // While we can't technically simulate a dropped connection
        // using Mirage, we can try to hit an endpoint that hasn't been
        // configured on our Mirage server, which similarly results in an
        // error being thrown.
        return networkStrategy({
          url: "http://localhost:1080/unconfuredendpoint",
          body: requestBody
        })
          .then(fail)
          .catch(error => {
            server.shutdown();
            expect(error).toBeDefined();
          });
      });
    });
  });

  // We don't have tests for sendBeacon because Mirage (actually, the Pretender
  // library that Mirage uses) doesn't support it yet.
  // https://github.com/pretenderjs/pretender/issues/249
});
