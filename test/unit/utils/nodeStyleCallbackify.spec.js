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

import Promise from "@adobe/reactor-promise";
import nodeStyleCallbackify from "../../../src/utils/nodeStyleCallbackify";

describe("nodeStyleCallbackify", () => {
  it("passes arguments to function", () => {
    const fn = jasmine.createSpy();
    const callback = () => {};

    nodeStyleCallbackify(fn)(2, 4, callback);

    expect(fn).toHaveBeenCalledWith(2, 4);
  });

  it("provides error to callback if function throws error", done => {
    const message = "Something bad happened";
    const fn = () => {
      throw new Error(message);
    };
    const callback = (err, data) => {
      expect(err).toEqual(jasmine.any(Error));
      expect(err.message).toBe("Something bad happened");
      expect(data).toBeUndefined();
      done();
    };

    nodeStyleCallbackify(fn)(callback);
  });

  it("provides error to callback if function returns rejected promise", done => {
    const message = "Something bad happened";
    const fn = () => {
      return Promise.reject(new Error(message));
    };
    const callback = (err, data) => {
      expect(err).toEqual(jasmine.any(Error));
      expect(err.message).toBe("Something bad happened");
      expect(data).toBeUndefined();
      done();
    };

    nodeStyleCallbackify(fn)(callback);
  });

  it("provides data to callback if function returns value", done => {
    const message = "Something good happened";
    const fn = () => {
      return message;
    };
    const callback = (err, data) => {
      expect(err).toBe(null);
      expect(data).toBe(message);
      done();
    };

    nodeStyleCallbackify(fn)(callback);
  });

  it("provides data to callback if function returns resolved promise", done => {
    const message = "Something good happened";
    const fn = () => {
      return Promise.resolve(message);
    };
    const callback = (err, data) => {
      expect(err).toBe(null);
      expect(data).toBe(message);
      done();
    };

    nodeStyleCallbackify(fn)(callback);
  });

  it("throws error if no callback provided", () => {
    const fn = () => {};

    expect(() => {
      nodeStyleCallbackify(fn)();
    }).toThrowError("The last argument must be a callback function.");

    expect(() => {
      nodeStyleCallbackify(fn)(2, 4);
    }).toThrowError("The last argument must be a callback function.");
  });
});
