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

import createEvent from "../../../../../src/components/DataCollector/createEvent";

describe("createEvent", () => {
  describe("applyCallback", () => {
    it("can add fields to empty xdm", () => {
      const callback = xdm => {
        xdm.foo = "bar";
      };
      const subject = createEvent();
      subject.applyCallback(callback);
      expect(subject.toJSON()).toEqual({ xdm: { foo: "bar" } });
    });

    it("can add fields to an existing xdm", () => {
      const callback = xdm => {
        xdm.b = "2";
      };
      const subject = createEvent();
      subject.mergeXdm({ a: "1" });
      subject.applyCallback(callback);
      expect(subject.toJSON()).toEqual({ xdm: { a: "1", b: "2" } });
    });

    it("can remove fields", () => {
      const callback = xdm => {
        delete xdm.a;
      };
      const subject = createEvent();
      subject.mergeXdm({ a: "1", b: "2" });
      subject.applyCallback(callback);
      expect(subject.toJSON()).toEqual({ xdm: { b: "2" } });
    });

    it("doesn't merge when there is an exception", () => {
      const callback = xdm => {
        delete xdm.a;
        xdm.c = "foo";
        throw Error("Expected Error");
      };
      const subject = createEvent();
      subject.mergeXdm({ a: "1", b: "2" });
      expect(() => subject.applyCallback(callback)).toThrow();
      expect(subject.toJSON()).toEqual({ xdm: { a: "1", b: "2" } });
    });
  });
});
