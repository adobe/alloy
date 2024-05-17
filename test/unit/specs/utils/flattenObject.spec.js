/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import flattenObject from "../../../../src/utils/flattenObject.js";

describe("flattenObject", () => {
  it("flattens event object", () => {
    expect(
      flattenObject({
        xdm: {
          web: {
            webPageDetails: {
              viewName: "contact",
              URL: "https://localhost/aep.html#contact",
            },
            webReferrer: {
              URL: "https://google.com",
            },
          },
          timestamp: "2023-04-12T17:37:56.519Z",
          implementationDetails: {
            name: "https://ns.adobe.com/experience/alloy",
            version: "2.15.0",
            environment: "browser",
          },
        },
        data: {
          moo: "woof",
        },
      }),
    ).toEqual({
      "xdm.web.webPageDetails.viewName": "contact",
      "xdm.web.webPageDetails.URL": "https://localhost/aep.html#contact",
      "xdm.web.webReferrer.URL": "https://google.com",
      "xdm.timestamp": "2023-04-12T17:37:56.519Z",
      "xdm.implementationDetails.name": "https://ns.adobe.com/experience/alloy",
      "xdm.implementationDetails.version": "2.15.0",
      "xdm.implementationDetails.environment": "browser",
      "data.moo": "woof",
    });
  });

  it("flattens nested arrays", () => {
    expect(
      flattenObject({
        pre: true,
        a: {
          one: 1,
          two: 2,
          three: {
            aa: 2,
            bb: 43,
            cc: [
              "alf",
              "fred",
              {
                cool: "beans",
                lets: "go",
              },
            ],
          },
        },
        b: {
          one: 1,
          two: 2,
          three: {
            poo: true,
          },
        },
        c: {
          uno: true,
          dos: false,
          tres: {
            value: "yeah ok",
          },
        },
      }),
    ).toEqual({
      pre: true,
      "a.one": 1,
      "a.two": 2,
      "a.three.aa": 2,
      "a.three.bb": 43,
      "a.three.cc.0": "alf",
      "a.three.cc.1": "fred",
      "a.three.cc.2.cool": "beans",
      "a.three.cc.2.lets": "go",
      "b.one": 1,
      "b.two": 2,
      "b.three.poo": true,
      "c.uno": true,
      "c.dos": false,
      "c.tres.value": "yeah ok",
    });
  });

  it("handles non-objects", () => {
    expect(flattenObject(true)).toEqual(true);
    expect(flattenObject([1, 2, 3])).toEqual([1, 2, 3]);
    expect(flattenObject("hello")).toEqual("hello");

    let obj = new Set();
    expect(obj).toEqual(obj);

    obj = () => undefined;
    expect(flattenObject(obj)).toEqual(obj);
  });
});
