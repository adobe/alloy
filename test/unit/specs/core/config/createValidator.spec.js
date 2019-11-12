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

import createConfigValidator from "../../../../../src/core/config/createValidator";
import createConfig from "../../../../../src/core/config/createConfig";

let testConfig;

const required = (key, currentValue) => {
  if (currentValue == null) {
    throw new Error("orgId is missing");
  }
};

const testValidator1 = {
  a: {
    validate: required
  },
  a2: {
    defaultValue: "zyx"
  }
};

const testValidator2 = {
  imsOrgId: {
    isRequired: true,
    validate: required
  }
};

describe("createValidator", () => {
  beforeEach(() => {
    testConfig = {
      a: 123,
      b: "abc",
      c: {
        a1: "xyz"
      },
      neg: {
        neg: false
      }
    };
  });
  it("supports validation against a schema", () => {
    const config = createConfig(testConfig);
    const configValidator = createConfigValidator(config);

    configValidator.addValidators(testValidator1);
    expect(() => {
      configValidator.validate();
    }).not.toThrow();
  });
  it("throws error when validation fails", () => {
    const config = createConfig(testConfig);
    const configValidator = createConfigValidator(config);

    configValidator.addValidators(testValidator1);
    configValidator.addValidators(testValidator2);
    expect(() => {
      configValidator.validate();
    }).toThrow();
  });
  it("sets default if defined in validator", () => {
    const config = createConfig(testConfig);
    const configValidator = createConfigValidator(config);

    configValidator.addValidators(testValidator1);
    configValidator.validate();
    expect(config.a2).toEqual("zyx");
  });
});
