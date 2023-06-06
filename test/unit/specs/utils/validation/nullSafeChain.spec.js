/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import nullSafeChain from "../../../../../src/utils/validation/nullSafeChain";

describe("validation::nullSafeChain", () => {
  it("doesn't call the underlying validators when null is passed in", () => {
    const validator1 = jasmine.createSpy();
    const validator2 = jasmine.createSpy();
    const validator3 = jasmine.createSpy();
    validator1.and.returnValue(null);
    const subject = nullSafeChain(
      nullSafeChain(validator1, validator2),
      validator3
    );
    expect(subject(null, "myKey", { foo: "bar" })).toEqual(null);
    expect(validator1).toHaveBeenCalledTimes(1);
    expect(validator1).toHaveBeenCalledWith(null, "myKey", { foo: "bar" });
    expect(validator2).toHaveBeenCalledTimes(0);
    expect(validator3).toHaveBeenCalledTimes(0);
  });
});
