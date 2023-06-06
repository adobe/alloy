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

import chain from "../../../../../src/utils/validation/chain";

describe("validation::chain", () => {
  it("calls the validators with the correct params", () => {
    const myThis = { my: "context" };
    const validator1 = jasmine.createSpy();
    const validator2 = jasmine.createSpy();
    const validator3 = jasmine.createSpy();
    validator1.and.returnValue("validator1return");
    validator2.and.returnValue("validator2return");
    validator3.and.returnValue("validator3return");
    const subject = chain(chain(validator1, validator2), validator3);
    expect(subject.call(myThis, "myCurrentValue", "myKey", "myParent")).toEqual(
      "validator3return"
    );
    expect(validator1).toHaveBeenCalledTimes(1);
    expect(validator1).toHaveBeenCalledWith(
      "myCurrentValue",
      "myKey",
      "myParent"
    );
    expect(validator1.calls.thisFor(0)).toBe(myThis);
    expect(validator2).toHaveBeenCalledTimes(1);
    expect(validator2).toHaveBeenCalledWith(
      "validator1return",
      "myKey",
      "myParent"
    );
    expect(validator2.calls.thisFor(0)).toBe(myThis);
    expect(validator3).toHaveBeenCalledTimes(1);
    expect(validator3).toHaveBeenCalledWith(
      "validator2return",
      "myKey",
      "myParent"
    );
    expect(validator3.calls.thisFor(0)).toBe(myThis);
  });

  it("short circuits evaluation", () => {
    const validator1 = jasmine.createSpy();
    const validator2 = jasmine.createSpy();
    const validator3 = jasmine.createSpy();
    validator1.and.returnValue("validator1return");
    validator2.and.throwError("My Error!");
    validator3.and.returnValue("validator3return");
    const subject = chain(chain(validator1, validator2), validator3);
    expect(() => subject("myCurrentValue", "myKey", "myParent")).toThrow(
      Error("My Error!")
    );
    expect(validator3).not.toHaveBeenCalled();
  });
});
