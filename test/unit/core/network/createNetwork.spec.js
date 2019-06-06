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

fdescribe("createNetwork", () => {
  const config = {
    collectionDomain: "alloy.mysite.com",
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
          "https://alloy.mysite.com/interact?propertyID=mypropertyid"
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
    const { send } = network.newRequest();
    send();
  });

  it("can call collect", done => {
    const networkStrategy = url => {
      return new Promise(() => {
        expect(url).toEqual(
          "https://alloy.mysite.com/collect?propertyID=mypropertyid"
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
    const { send } = network.newRequest(false);
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
        resolve(JSON.stringify({ requestId: "myrequestid", handle: [] }));
      });
    };
    const network = createNetwork(
      config,
      logger,
      nullLifecycle,
      networkStrategy
    );
    const { responsePromise, send } = network.newRequest();
    responsePromise
      .then(body => {
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
        reject(new Error("myerror"));
      });
    };
    const network = createNetwork(
      config,
      logger,
      nullLifecycle,
      networkStrategy
    );
    const { responsePromise, send } = network.newRequest();
    responsePromise.catch(error => {
      expect(error.message).toEqual("myerror");
      done();
    });
    send();
  });

  it("resolves the promise even with invalid json", done => {
    const networkStrategy = () => {
      return new Promise(resolve => {
        resolve("badbody");
      });
    };
    const component = createNetwork(
      config,
      logger,
      nullLifecycle,
      networkStrategy
    );
    const { responsePromise, send } = component.newRequest();
    responsePromise
      .then(body => {
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
        resolve(JSON.stringify(myresponse));
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
        onBeforeSend: ({ payload, responsePromise, isBeacon, send }) => {
          expect(send).toBeUndefined();
          expect(payload).toBe(requestPayload);
          expect(responsePromise).toBe(requestPromise);
          expect(isBeacon).toBe(b);
          done();
        },
        onResponseFragment: () => undefined
      };
      const networkStrategy = () => new Promise(() => undefined);
      const network = createNetwork(config, logger, lifecycle, networkStrategy);
      const { payload, responsePromise, send } = network.newRequest(b);
      requestPayload = payload;
      requestPromise = responsePromise;
      send();
    });
  });

  it("logs json parse errors", done => {
    const networkStrategy = () => {
      return Promise.resolve("badbody1");
    };
    const loggerSpy = jasmine.createSpyObj("logger", ["warn"]);
    const network = createNetwork(
      config,
      loggerSpy,
      nullLifecycle,
      networkStrategy
    );
    const { send } = network.newRequest();
    send();
    setTimeout(() => {
      expect(loggerSpy.warn).toHaveBeenCalledTimes(1);
      done();
    }, 100);
  });

  it("doesn't try to parse the response on a beacon call", done => {
    const networkStrategy = () => {
      return Promise.resolve();
    };
    const loggerSpy = jasmine.createSpyObj("logger", ["warn"]);
    const network = createNetwork(
      config,
      console,
      nullLifecycle,
      networkStrategy
    );
    const { send } = network.newRequest(true);
    send();
    setTimeout(() => {
      expect(loggerSpy.warn).not.toHaveBeenCalled();
      done();
    }, 100);
  });
});
