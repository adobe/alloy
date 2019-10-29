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

// eslint-disable-next-line no-unused-vars
import createConfigValidators from "../../../../../src/components/ActivityCollector/createConfigValidators";
import createConfig from "../../../../../src/core/createConfig";
import { config } from "rxjs";

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
      configObj.addValidators(createConfigValidators());
      configObj.validate();
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
      configObj.addValidators(createConfigValidators());
      expect(() => {
        configObj.validate();
      }).toThrowError();
    });
  });

  [
    "clickCollectionEnabled",
    "downloadLinkQualifier" 
  ].forEach((cfgKey, i) => {
    fit(`add default configuration key (${i})`, () => {
      const configObj = createConfig({});
      configObj.addValidators(createConfigValidators());
      configObj.validate();
      expect(configObj[cfgKey]).toBeDefined();
    });
  });

});
