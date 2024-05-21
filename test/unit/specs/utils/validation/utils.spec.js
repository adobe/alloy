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

import {
  chain,
  nullSafeChain,
  assertValid,
} from "../../../../../src/utils/validation/utils.js";

describe("validation::utils", () => {
  describe("chain", () => {
    it("calls the validators with the correct params", () => {
      const validator1 = jasmine.createSpy();
      const validator2 = jasmine.createSpy();
      const validator3 = jasmine.createSpy();
      validator1.and.returnValue("validator1return");
      validator2.and.returnValue("validator2return");
      validator3.and.returnValue("validator3return");
      const subject = chain(chain(validator1, validator2), validator3);
      expect(subject("myCurrentValue", "myKey")).toEqual("validator3return");
      expect(validator1).toHaveBeenCalledTimes(1);
      expect(validator1).toHaveBeenCalledWith("myCurrentValue", "myKey");
      expect(validator2).toHaveBeenCalledTimes(1);
      expect(validator2).toHaveBeenCalledWith("validator1return", "myKey");
      expect(validator3).toHaveBeenCalledTimes(1);
      expect(validator3).toHaveBeenCalledWith("validator2return", "myKey");
    });

    it("short circuits evaluation", () => {
      const validator1 = jasmine.createSpy();
      const validator2 = jasmine.createSpy();
      const validator3 = jasmine.createSpy();
      validator1.and.returnValue("validator1return");
      validator2.and.throwError("My Error!");
      validator3.and.returnValue("validator3return");
      const subject = chain(chain(validator1, validator2), validator3);
      expect(() => subject("myCurrentValue", "myKey")).toThrow(
        Error("My Error!"),
      );
      expect(validator3).not.toHaveBeenCalled();
    });
  });

  describe("nullSafeChain", () => {
    it("doesn't call the underlying validators when null is passed in", () => {
      const validator1 = jasmine.createSpy();
      const validator2 = jasmine.createSpy();
      const validator3 = jasmine.createSpy();
      validator1.and.returnValue(null);
      const subject = nullSafeChain(
        nullSafeChain(validator1, validator2),
        validator3,
      );
      expect(subject(null, "myKey")).toEqual(null);
      expect(validator1).toHaveBeenCalledTimes(1);
      expect(validator1).toHaveBeenCalledWith(null, "myKey");
      expect(validator2).toHaveBeenCalledTimes(0);
      expect(validator3).toHaveBeenCalledTimes(0);
    });
  });

  describe("assertValid", () => {
    it("throws an error when it is invalid", () => {
      expect(() =>
        assertValid(false, "myValue", "myPath", "myMessage"),
      ).toThrowMatching((e) => {
        expect(e.message).toEqual(
          `'myPath': Expected myMessage, but got "myValue".`,
        );
        return true;
      });
    });

    it("does not throw an error when it is valid", () => {
      expect(
        assertValid(true, "myValue", "myPath", "myMessage"),
      ).toBeUndefined();
    });
  });
});
