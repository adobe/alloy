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

export default (description, validator, specObjects) => {
  describe(description, () => {
    specObjects.forEach(
      ({ value, expected = value, error = false, warning = false }) => {
        if (error) {
          it(`rejects ${JSON.stringify(value)}`, () => {
            const logger = jasmine.createSpyObj("logger", ["warn"]);
            expect(() =>
              validator.call({ logger }, value, "mykey"),
            ).toThrowMatching((e) => {
              return /'mykey[^']*'(:| is)/.test(e.message);
            });
            if (warning) {
              expect(logger.warn).toHaveBeenCalled();
            } else {
              expect(logger.warn).not.toHaveBeenCalled();
            }
          });
        } else {
          it(`transforms \`${JSON.stringify(value)}\` to \`${JSON.stringify(
            expected,
          )}\``, () => {
            const logger = jasmine.createSpyObj("logger", ["warn"]);
            expect(validator.call({ logger }, value, "mykey")).toEqual(
              expected,
            );
            if (warning) {
              expect(logger.warn).toHaveBeenCalled();
            } else {
              expect(logger.warn).not.toHaveBeenCalled();
            }
          });
        }
      },
    );
  });
};
