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

import createConfigValidators from "../../../../../src/components/ActivityCollector/createConfigValidators";
import createConfig from "../../../../../src/core/config/createConfig";
import createValidator from "../../../../../src/core/config/createValidator";

describe("ActivityCollector::createConfigValidators", () => {
  [
    {},
    {
      clickCollectionEnabled: false
    },
    {
      clickCollectionEnabled: false,
      downloadLinkQualifier: ""
    }
  ].forEach((cfg, i) => {
    it(`validates configuration (${i})`, () => {
      const configObj = createConfig(cfg);
      const configValidator = createValidator(configObj);

      configValidator.addValidators(createConfigValidators());
      configValidator.validate();
    });
  });

  [
    { clickCollectionEnabled: "" },
    {
      clickCollectionEnabled: true,
      downloadLinkQualifier: "["
    }
  ].forEach((cfg, i) => {
    it(`invalidates configuration (${i})`, () => {
      const configObj = createConfig(cfg);
      const configValidator = createValidator(configObj);

      configValidator.addValidators(createConfigValidators());
      expect(() => {
        configValidator.validate();
      }).toThrowError();
    });
  });

  ["clickCollectionEnabled", "downloadLinkQualifier"].forEach((cfgKey, i) => {
    it(`add default configuration key (${i})`, () => {
      const configObj = createConfig({});
      const configValidator = createValidator(configObj);

      configValidator.addValidators(createConfigValidators());
      configValidator.validate();
      expect(configObj[cfgKey]).toBeDefined();
    });
  });
});
