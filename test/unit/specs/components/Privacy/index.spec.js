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

import createPrivacyComponent from "../../../../../src/components/Privacy/index";
import createConfig from "../../../../../src/core/config/createConfig";
import createValidator from "../../../../../src/core/config/createValidator";

describe("Privacy::index", () => {
  [{}, { optInEnabled: true }, { optInEnabled: false }].forEach(cfg => {
    it(`validates configuration (${JSON.stringify(cfg)})`, () => {
      const configObj = createConfig(cfg);
      const validator = createValidator(configObj);

      validator.addValidators(createPrivacyComponent.configValidators);
      validator.validate();
    });
  });

  [{ optInEnabled: "foo" }].forEach(cfg => {
    it(`invalidates configuration (${JSON.stringify(cfg)})`, () => {
      const configObj = createConfig(cfg);
      const validator = createValidator(configObj);

      validator.addValidators(createPrivacyComponent.configValidators);
      expect(() => validator.validate()).toThrowError();
    });
  });
});
