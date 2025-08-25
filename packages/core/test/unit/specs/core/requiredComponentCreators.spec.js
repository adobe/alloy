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

import { describe, it, expect } from "vitest";
import * as requiredComponentCreators from "../../../../src/core/requiredComponentCreators.js";

describe("requiredComponentCreators", () => {
  it("is an object of component creators", () => {
    const c = Object.keys(requiredComponentCreators).reduce((acc, key) => {
      acc.push(requiredComponentCreators[key]);
      return acc;
    }, []);
    expect(c).toEqual(expect.any(Array));
    c.forEach((componentCreator) => {
      expect(componentCreator).toEqual(expect.any(Function));
      expect(componentCreator.namespace).toEqual(expect.any(String));
      if (componentCreator.configValidators) {
        // should export a validator function
        expect(componentCreator.configValidators).toEqual(expect.any(Function));
      }
    });
  });
});
