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
import createConfig from "../../../../../src/core/createConfig";

describe("Privacy::index", () => {
  [{}, { optInEnabled: true }, { optInEnabled: false }].forEach(cfg => {
    it(`validates configuration (${JSON.stringify(cfg)})`, () => {
      const configObj = createConfig(cfg);
      configObj.addValidators(createPrivacyComponent.configValidators);
      configObj.validate();
    });
  });

  [{ optInEnabled: "foo" }].forEach(cfg => {
    it(`invalidates configuration (${JSON.stringify(cfg)})`, () => {
      const configObj = createConfig(cfg);
      configObj.addValidators(createPrivacyComponent.configValidators);
      expect(() => configObj.validate()).toThrowError();
    });
  });
});
