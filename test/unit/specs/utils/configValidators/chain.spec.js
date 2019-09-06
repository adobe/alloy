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

import chain from "../../../../../src/utils/configValidators/chain";

describe("configValidators::chain", () => {
  it("calls the validators with the correct params", () => {
    const validator1 = jasmine.createSpy();
    const validator2 = jasmine.createSpy();
    const validator3 = jasmine.createSpy();
    validator1.and.returnValue("");
    validator2.and.returnValue("");
    validator3.and.returnValue("");
    const subject = chain(chain(validator1, validator2), validator3);
    expect(subject("myKey", "myCurrentValue", "myDefaultValue")).toEqual("");
    expect(validator1).toHaveBeenCalledTimes(1);
    expect(validator1).toHaveBeenCalledWith(
      "myKey",
      "myCurrentValue",
      "myDefaultValue"
    );
    expect(validator2).toHaveBeenCalledTimes(1);
    expect(validator2).toHaveBeenCalledWith(
      "myKey",
      "myCurrentValue",
      "myDefaultValue"
    );
    expect(validator3).toHaveBeenCalledTimes(1);
    expect(validator3).toHaveBeenCalledWith(
      "myKey",
      "myCurrentValue",
      "myDefaultValue"
    );
  });

  it("short circuits evaluation", () => {
    const validator1 = jasmine.createSpy();
    const validator2 = jasmine.createSpy();
    const validator3 = jasmine.createSpy();
    validator1.and.returnValue("");
    validator2.and.returnValue("My Error!");
    validator3.and.returnValue("");
    const subject = chain(chain(validator1, validator2), validator3);
    expect(subject("myKey", "myCurrentValue", "myDefaultValue")).toEqual(
      "My Error!"
    );
    expect(validator3).not.toHaveBeenCalled();
  });
});
