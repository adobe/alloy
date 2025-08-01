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
import { vi, it, expect } from "vitest";

export default ({
  configValidators,
  validConfigurations,
  invalidConfigurations,
  deprecatedConfigurations = [],
  defaultValues,
}) => {
  validConfigurations.forEach((cfg, i) => {
    // eslint-disable-next-line vitest/expect-expect -- configValidators contains validations
    it(`validates configuration (${i})`, () => {
      configValidators(cfg);
    });
  });
  invalidConfigurations.forEach((cfg, i) => {
    it(`invalidates configuration (${i})`, () => {
      expect(() => {
        configValidators(cfg);
      }).toThrowError();
    });
  });
  it("provides default values", () => {
    const config = configValidators({});
    Object.keys(defaultValues).forEach((key) => {
      expect(config[key]).toBe(defaultValues[key]);
    });
  });
  deprecatedConfigurations.forEach((cfg, i) => {
    it(`outputs messages for deprecated fields (${i})`, () => {
      const logger = {
        warn: vi.fn(),
      };
      configValidators.call(
        {
          logger,
        },
        cfg,
      );
      expect(logger.warn).toHaveBeenCalled();
    });
  });
};
