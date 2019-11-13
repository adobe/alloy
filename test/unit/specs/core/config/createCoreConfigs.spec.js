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

import createCoreConfigs from "../../../../../src/core/config/createCoreConfigs";
import createValidator from "../../../../../src/core/config/createValidator";
import createConfig from "../../../../../src/core/config/createConfig";

describe("createCoreConfigs", () => {
  const baseConfig = { configId: "1234", imsOrgId: "org1" };

  describe("errorsEnabled", () => {
    it("validates errorsEnabled=undefined", () => {
      const config = createConfig(baseConfig);
      const validator = createValidator(config);

      validator.addValidators(createCoreConfigs());
      validator.validate();
      expect(config.errorsEnabled).toBe(true);
    });

    it("validates errorsEnabled=true", () => {
      const config = createConfig({ errorsEnabled: true, ...baseConfig });
      const validator = createValidator(config);

      validator.addValidators(createCoreConfigs());
      validator.validate();
      expect(config.errorsEnabled).toBe(true);
    });

    it("validates errorsEnabled=false", () => {
      const config = createConfig({ errorsEnabled: false, ...baseConfig });
      const validator = createValidator(config);

      validator.addValidators(createCoreConfigs());
      validator.validate();
      expect(config.errorsEnabled).toBe(false);
    });

    it("validates errorsEnabled=123", () => {
      const config = createConfig({ errorsEnabled: 123, ...baseConfig });
      const validator = createValidator(config);

      validator.addValidators(createCoreConfigs());
      expect(() => {
        validator.validate();
      }).toThrowError();
    });
  });

  describe("logEnabled", () => {
    it("validates logEnabled=undefined", () => {
      const config = createConfig(baseConfig);
      const validator = createValidator(config);

      validator.addValidators(createCoreConfigs());
      validator.validate();
      expect(config.logEnabled).toBe(false);
    });

    it("validates logEnabled=true", () => {
      const config = createConfig({ logEnabled: true, ...baseConfig });
      const validator = createValidator(config);

      validator.addValidators(createCoreConfigs());
      validator.validate();
      expect(config.logEnabled).toBe(true);
    });

    it("validates logEnabled=false", () => {
      const config = createConfig({ logEnabled: false, ...baseConfig });
      const validator = createValidator(config);

      validator.addValidators(createCoreConfigs());
      validator.validate();
      expect(config.logEnabled).toBe(false);
    });

    it("validates logEnabled=123", () => {
      const config = createConfig({ logEnabled: 123, ...baseConfig });
      const validator = createValidator(config);

      validator.addValidators(createCoreConfigs());
      expect(() => {
        validator.validate();
      }).toThrowError();
    });
  });

  [
    { configId: "", imsOrgId: "" },
    {
      configId: "myproperty1",
      imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      configId: "myproperty1",
      edgeDomain: "stats.firstparty.com",
      imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      configId: "myproperty1",
      edgeDomain: "STATS.FIRSTPARY.COM",
      imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      configId: "myproperty1",
      edgeDomain: "STATS.FIRSTPARY.COM",
      imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    }
  ].forEach((cfg, i) => {
    it(`validates configuration (${i})`, () => {
      const configObj = createConfig(cfg);
      const validator = createValidator(configObj);

      validator.addValidators(createCoreConfigs());
      validator.validate();
    });
  });

  [
    {},
    { configId: "myproperty1", edgeDomain: "" },
    { configId: "myproperty1", edgeDomain: "stats firstparty.com" },
    {
      configId: "myproperty1",
      edgeDomain: "stats firstparty.com",
      prehidingStyle: ""
    },
    {
      configId: "myproperty1",
      edgeBasePath: 123
    }
  ].forEach((cfg, i) => {
    it(`invalidates configuration (${i})`, () => {
      const configObj = createConfig(cfg);
      const validator = createValidator(configObj);

      validator.addValidators(createCoreConfigs());
      expect(() => validator.validate()).toThrowError();
    });
  });

  it("invalidates duplicate configIds", () => {
    const validators = createCoreConfigs();
    const config1 = createConfig({ configId: "property1", imsOrgId: "ims1" });
    const config2 = createConfig({ configId: "property2", imsOrgId: "ims2" });
    const config3 = createConfig({ configId: "property1", imsOrgId: "ims3" });

    const validator1 = createValidator(config1);
    const validator2 = createValidator(config2);
    const validator3 = createValidator(config3);

    validator1.addValidators(validators);
    validator2.addValidators(validators);
    validator3.addValidators(validators);
    validator1.validate();
    validator2.validate();
    expect(() => validator3.validate()).toThrowError();
  });

  it("invalidates duplicate imsOrgIds", () => {
    const validators = createCoreConfigs();
    const config1 = createConfig({ configId: "a", imsOrgId: "a" });
    const config2 = createConfig({ configId: "b", imsOrgId: "b" });
    const config3 = createConfig({ configId: "c", imsOrgId: "a" });

    const validator1 = createValidator(config1);
    const validator2 = createValidator(config2);
    const validator3 = createValidator(config3);

    validator1.addValidators(validators);
    validator2.addValidators(validators);
    validator3.addValidators(validators);
    validator1.validate();
    validator2.validate();
    expect(() => validator3.validate()).toThrowError();
  });
});
