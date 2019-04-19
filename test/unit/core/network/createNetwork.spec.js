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

import createNetwork from "../../../../src/core/network/createNetwork";

describe("createNetwork", () => {
  const config = {
    collectionUrl: "https://alloy.mysite.com/v1",
    propertyID: "mypropertyid"
  };

  const logger = console.log;
  const nullLifecycle = {
    onBeforeSend: () => Promise.resolve(),
    onResponseFragment: () => Promise.resolve()
  };

  it("calls interact by default", done => {
    const networkStrategy = url => {
      return new Promise(() => {
        expect(url).toEqual(
          "https://alloy.mysite.com/v1/interact?propertyID=mypropertyid"
        );
        done();
      });
    };
    const network = createNetwork(
      config,
      logger,
      nullLifecycle,
      networkStrategy
    );
    const { send, beacon } = network.newRequest();
    expect(beacon).toBe(false);
    send();
  });

  it("can call collect", done => {
    const networkStrategy = url => {
      return new Promise(() => {
        expect(url).toEqual(
          "https://alloy.mysite.com/v1/collect?propertyID=mypropertyid"
        );
        done();
      });
    };
    const network = createNetwork(
      config,
      logger,
      nullLifecycle,
      networkStrategy
    );
    const { send, beacon } = network.newRequest(true);
    expect(beacon).toBe(true);
    send();
  });

  it("sends the payload", done => {
    const networkStrategy = (url, json) => {
      return new Promise(resolve => {
        expect(JSON.parse(json).events[0]).toEqual({ id: "myevent1" });
        resolve();
        done();
      });
    };
    const network = createNetwork(
      config,
      logger,
      nullLifecycle,
      networkStrategy
    );
    const { payload, send } = network.newRequest();
    payload.addEvent({ id: "myevent1" });
    send();
  });

  it("resolves the returned promise", done => {
    const networkStrategy = () => {
      return new Promise(resolve => {
        resolve({
          body: JSON.stringify({ requestId: "myrequestid", handle: [] })
        });
      });
    };
    const network = createNetwork(
      config,
      logger,
      nullLifecycle,
      networkStrategy
    );
    const { response, send } = network.newRequest();
    response
      .then(({ body }) => {
        const { requestId, handle } = JSON.parse(body);
        expect(requestId).toEqual("myrequestid");
        expect(handle).toEqual([]);
        done();
      })
      .catch(done.fail);
    send();
  });

  it("rejects the returned promise", done => {
    const networkStrategy = () => {
      return new Promise((resolve, reject) => {
        reject(Error("myerror"));
      });
    };
    const network = createNetwork(
      config,
      logger,
      nullLifecycle,
      networkStrategy
    );
    const { response, send } = network.newRequest();
    response.catch(error => {
      expect(error.message).toEqual("myerror");
      done();
    });
    send();
  });

  it("resolves the promise even with invalid json", done => {
    const networkStrategy = () => {
      return new Promise(resolve => {
        resolve({ body: "badbody" });
      });
    };
    const component = createNetwork(
      config,
      logger,
      nullLifecycle,
      networkStrategy
    );
    const { response, send } = component.newRequest();
    response
      .then(({ body }) => {
        expect(body).toEqual("badbody");
        done();
      })
      .catch(done.fail);
    send();
  });

  it("allows components to handle response fragments", done => {
    const myresponse = {
      requestId: "myrequestid",
      handle: [
        {
          type: "mytype",
          payload: { id: "myfragmentid" }
        }
      ]
    };
    const lifecycle = {
      onBeforeSend: () => undefined,
      onResponse: response => {
        const cleanResponse = JSON.parse(JSON.stringify(response));
        expect(cleanResponse).toEqual(myresponse);
        done();
      }
    };
    const networkStrategy = () => {
      return new Promise(resolve => {
        resolve({ body: JSON.stringify(myresponse) });
      });
    };
    const network = createNetwork(config, logger, lifecycle, networkStrategy);
    network.newRequest().send();
  });

  [true, false].forEach(b => {
    it(`allows components to get the request info (beacon = ${b})`, done => {
      let requestPayload;
      let requestPromise;
      const lifecycle = {
        onBeforeSend: ({ payload, response, beacon, send }) => {
          expect(send).toBeUndefined();
          expect(payload).toBe(requestPayload);
          expect(response).toBe(requestPromise);
          expect(beacon).toBe(b);
          done();
        },
        onResponseFragment: () => undefined
      };
      const networkStrategy = () => new Promise(() => undefined);
      const network = createNetwork(config, logger, lifecycle, networkStrategy);
      const { payload, response, send } = network.newRequest(b);
      requestPayload = payload;
      requestPromise = response;
      send();
    });
  });

  it("handles response fragments in streaming responses", done => {
    const response1 = {
      requestId: "myrequestid",
      handle: [{ type: "mytype", payload: { id: "payload1" } }]
    };
    const response2 = {
      requestId: "myrequestid",
      handle: [{ type: "mytype", payload: { id: "payload2" } }]
    };
    let i = 0;
    const lifecycle = {
      onBeforeSend: () => undefined,
      onResponse: response => {
        i += 1;
        const cleanResponse = JSON.parse(JSON.stringify(response));
        if (i === 1) {
          expect(cleanResponse).toEqual(response1);
        } else {
          expect(cleanResponse).toEqual(response2);
          done();
        }
      }
    };
    const networkStrategy = () => {
      return new Promise(resolve1 => {
        const promise = new Promise(resolve2 => {
          resolve2({ body: JSON.stringify(response2) });
        });
        resolve1({ body: JSON.stringify(response1), promise });
      });
    };
    const network = createNetwork(config, logger, lifecycle, networkStrategy);
    network.newRequest().send();
  });

  it("handles json errors in streaming responses", done => {
    const networkStrategy = () => {
      return new Promise(resolve1 => {
        const promise = new Promise(resolve2 => {
          resolve2({ body: "badbody2" });
        });
        resolve1({ body: "badbody1", promise });
      });
    };
    const network = createNetwork(
      config,
      logger,
      nullLifecycle,
      networkStrategy
    );
    const { response, send } = network.newRequest();
    response.then(({ body: body1, promise: promise1 }) => {
      expect(body1).toEqual("badbody1");
      promise1.then(({ body: body2, promise: promise2 }) => {
        expect(body2).toEqual("badbody2");
        expect(promise2).toBeUndefined();
        done();
      });
    });
    send();
  });

  it("logs json parse errors", done => {
    const networkStrategy = () => {
      return new Promise(resolve => {
        resolve({ body: "badbody1" });
      });
    };
    const loggerSpy = jasmine.createSpyObj("logger", ["warn"]);
    const network = createNetwork(
      config,
      loggerSpy,
      nullLifecycle,
      networkStrategy
    );
    const { send, complete } = network.newRequest();
    send();
    complete
      .then(() => {
        expect(loggerSpy.warn).toHaveBeenCalledTimes(1);
        done();
      })
      .catch(done.fail);
  });

  it("doesn't try to parse the response on a beacon call", done => {
    const networkStrategy = () => {
      return Promise.resolve();
    };
    const loggerSpy = jasmine.createSpyObj("logger", ["warn"]);
    const network = createNetwork(
      config,
      loggerSpy,
      nullLifecycle,
      networkStrategy
    );
    const { send, complete } = network.newRequest(true);
    send();
    complete
      .then(() => {
        expect(loggerSpy.warn).not.toHaveBeenCalled();
        done();
      })
      .catch(done.fail);
  });
});
